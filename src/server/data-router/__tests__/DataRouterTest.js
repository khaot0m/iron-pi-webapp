// @flow

import {expect} from 'chai'

import EventEmitter from 'events'
import _ from 'lodash'

import type {PluginConfig} from '../../../universal/data-router/PluginConfigTypes'

import DataRouter, {timestampDispatchData, PLUGIN_EVENT_DATA, PLUGIN_EVENT_TIMESTAMPED_DATA} from '../DataRouter'
import type {DataPlugin, InputChangeEvent, CycleDoneEvent, DataPluginMapping, TimeValuePair} from '../PluginTypes'

const EVENT_INPUTS_CHANGED = 'INPUTS_CHANGED'
const EVENT_DISPATCH_CYCLE_DONE = 'DISPATCH_CYCLE_DONE'

type MockPluginEvent = {
  plugin: MockPlugin,
  type: string,
  time: number,
  changedTags: Array<string>,
}

type MockPluginArgs = {events: Array<MockPluginEvent>, magic: number, mappings: Array<DataPluginMapping>}

class MockPlugin extends EventEmitter implements DataPlugin {
  _rxEvents: Array<MockPluginEvent>;
  _magic: number;
  _mappings: Array<DataPluginMapping>;

  constructor(args: MockPluginArgs) {
    super()
    this._rxEvents = args.events
    this._magic = args.magic
    this._mappings = args.mappings
  }
  start() { }
  config(): PluginConfig {
    return {
      pluginType: 'mockPlugin',
      pluginInstanceId: `mockPlugin${this._magic}`,
      pluginInstanceName: `Mock Plugin ${this._magic}`
    }
  }
  setConfig(config: PluginConfig) {

  }
  inputsChanged(event: InputChangeEvent) {
    this._pushEvent({event, type: EVENT_INPUTS_CHANGED})
  }
  dispatchCycleDone(event: CycleDoneEvent) {
    this._pushEvent({event, type: EVENT_DISPATCH_CYCLE_DONE})
  }
  _pushEvent(args: {event: InputChangeEvent, type: string}) {
    // make events easier to deep compare by omitting tagMap and converting changedTags into a sorted array
    this._rxEvents.push({
      ...(_.omit(args.event, 'tagMap')),
      plugin: this,
      type: args.type,
      changedTags: Array.from(args.event.changedTags).sort()
    })
  }
  ioMappings(): Array<DataPluginMapping> { return this._mappings }
}

class AdderPlugin extends MockPlugin {
  _sourceTag: string;
  _destTag: string;
  _amount: number;
  constructor(args: {events: Array<MockPluginEvent>, magic: number,
      sourceTag: string, destTag: string, amount?: number}) {
    super({events: args.events, magic: args.magic, mappings: [
      {id: 'adderInput', name: 'Adder Input', tagsToPlugin: [args.sourceTag]},
      {id: 'adderOutput', name: 'Adder Output', tagFromPlugin: args.destTag}
    ]})
    this._sourceTag = args.sourceTag
    this._destTag = args.destTag
    this._amount = args.amount === undefined ? 1 : args.amount
  }
  inputsChanged(event: InputChangeEvent) {
    super.inputsChanged(event)
    const srcValuePair: ?TimeValuePair = event.tagMap[this._sourceTag]
    this.emit(PLUGIN_EVENT_DATA, {[this._destTag]: srcValuePair ? srcValuePair.v + this._amount : NaN})
  }
}

describe('DataRouter', () => {
  it('notifies plugins when their inputs change', () => {
    const events: Array<MockPluginEvent> = []
    const popEvents = () => {
      const _events = events.slice(0)
      events.splice(0, events.length)
      return _events
    }

    const plugin1 = new MockPlugin({events, magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
      {id: 'output2', name: 'Output 2', tagFromPlugin: 'b'}
    ]})
    const plugin2 = new MockPlugin({events, magic: 2, mappings: [
      {id: 'input1', name: 'Input 1', tagsToPlugin: ['a']},
      {id: 'input2', name: 'Input 2', tagsToPlugin: ['b']}
    ]})

    let time = 100
    const router: DataRouter = new DataRouter({plugins: [plugin1, plugin2]})
    router._getTime = () => time

    expect(popEvents()).to.be.empty

    router.dispatch({pluginId: plugin1.config().pluginInstanceId, timestampedValues: {
      a: {t: 100, v: 200},
      b: {t: 300, v: 400}
    }})

    expect(popEvents()).to.deep.equal([
      {plugin: plugin2, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a', 'b']},
      {plugin: plugin1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: false},
      {plugin: plugin2, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: true}
    ])

    expect(router.tagMap()).to.deep.equal({
      a: {t: 100, v: 200},
      b: {t: 300, v: 400}
    })
  })

  it('handles cascading updates', () => {
    const events: Array<MockPluginEvent> = []
    const popEvents = () => {
      const _events = events.slice(0)
      events.splice(0, events.length)
      return _events
    }

    const sourcePlugin = new MockPlugin({events, magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
      {id: 'output2', name: 'Output 2', tagFromPlugin: 'b'}
    ]})
    const adder1 = new AdderPlugin({
      events,
      magic: 2,
      sourceTag: 'b',
      destTag: 'c',
      amount: 2
    })
    const adder2 = new AdderPlugin({
      events,
      magic: 3,
      sourceTag: 'c',
      destTag: 'd',
      amount: 3
    })

    let time = 100
    const router: DataRouter = new DataRouter({plugins: [sourcePlugin, adder1, adder2]})
    router._getTime = () => time

    expect(popEvents()).to.be.empty

    router.dispatch({pluginId: sourcePlugin.config().pluginInstanceId, values: {a: 2, b: 3}})

    expect(popEvents()).to.deep.equal([
      {plugin: adder1, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a', 'b']},
      {plugin: adder2, type: EVENT_INPUTS_CHANGED, time, changedTags: ['c']},
      {plugin: sourcePlugin, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b', 'c', 'd'], inputsChanged: false},
      {plugin: adder1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b', 'c', 'd'], inputsChanged: true},
      {plugin: adder2, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b', 'c', 'd'], inputsChanged: true}
    ])

    expect(router.tagMap()).to.deep.equal({
      a: {t: 100, v: 2},
      b: {t: 100, v: 3},
      c: {t: 100, v: 5}, // adder1 outputs b + 2
      d: {t: 100, v: 8} // adder2 outputs c + 3
    })
  })

  it('handles spontaneously emitted plugin data', () => {
    const events: Array<MockPluginEvent> = []
    const popEvents = () => {
      const _events = events.slice(0)
      events.splice(0, events.length)
      return _events
    }

    const sourcePlugin = new MockPlugin({events, magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
    ]})
    const adder1 = new AdderPlugin({
      events,
      magic: 2,
      sourceTag: 'a',
      destTag: 'b',
      amount: 2
    })

    let time = 100
    const router: DataRouter = new DataRouter({plugins: [sourcePlugin, adder1]})
    router._getTime = () => time

    expect(popEvents()).to.be.empty

    sourcePlugin.emit(PLUGIN_EVENT_DATA, {a: 2})

    expect(popEvents()).to.deep.equal([
      {plugin: adder1, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a']},
      {plugin: sourcePlugin, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: false},
      {plugin: adder1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: true},
    ])

    expect(router.tagMap()).to.deep.equal({
      a: {t: 100, v: 2},
      b: {t: 100, v: 4}
    })

    time = 300
    sourcePlugin.emit(PLUGIN_EVENT_DATA, {a: 5})

    expect(popEvents()).to.deep.equal([
      {plugin: adder1, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a']},
      {plugin: sourcePlugin, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: false},
      {plugin: adder1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: true},
    ])

    expect(router.tagMap()).to.deep.equal({
      a: {t: 300, v: 5},
      b: {t: 300, v: 7}
    })
  })

  it('handles spontaneously emitted timestamped plugin data', () => {
    const events: Array<MockPluginEvent> = []
    const popEvents = () => {
      const _events = events.slice(0)
      events.splice(0, events.length)
      return _events
    }

    const sourcePlugin = new MockPlugin({events, magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
    ]})
    const adder1 = new AdderPlugin({
      events,
      magic: 2,
      sourceTag: 'a',
      destTag: 'b',
      amount: 2
    })

    let time = 1400
    const router: DataRouter = new DataRouter({plugins: [sourcePlugin, adder1]})
    router._getTime = () => time

    expect(popEvents()).to.be.empty

    sourcePlugin.emit(PLUGIN_EVENT_TIMESTAMPED_DATA, {a: {t: 500, v: 2}})

    expect(popEvents()).to.deep.equal([
      {plugin: adder1, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a']},
      {plugin: sourcePlugin, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: false},
      {plugin: adder1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: true},
    ])

    expect(router.tagMap()).to.deep.equal({
      a: {t: 500, v: 2},
      b: {t: 1400, v: 4}
    })

    time = 2500
    sourcePlugin.emit(PLUGIN_EVENT_TIMESTAMPED_DATA, {a: {t: 2000, v: 5}})

    expect(popEvents()).to.deep.equal([
      {plugin: adder1, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a']},
      {plugin: sourcePlugin, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: false},
      {plugin: adder1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: true},
    ])

    expect(router.tagMap()).to.deep.equal({
      a: {t: 2000, v: 5},
      b: {t: 2500, v: 7}
    })
  })

  it('removes listeners when removing plugins', () => {
    const plugin = new MockPlugin({events: [], magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
    ]})

    const router: DataRouter = new DataRouter({plugins: [plugin]})

    expect(plugin.listenerCount(PLUGIN_EVENT_DATA)).to.equal(1)
    expect(plugin.listenerCount(PLUGIN_EVENT_TIMESTAMPED_DATA)).to.equal(1)

    router.setPlugins([])

    expect(plugin.listenerCount(PLUGIN_EVENT_DATA)).to.equal(0)
    expect(plugin.listenerCount(PLUGIN_EVENT_TIMESTAMPED_DATA)).to.equal(0)
  })

  describe('timestampDispatchData', () => {
    const PLUGIN_ID = 'testPluginId'

    it('adds timestamps to data', () => {
      const PLUGIN_ID = 'testPluginId'
      const eventIn = {
        pluginId: PLUGIN_ID,
        values: {
          a: 1,
          b: 2
        }
      }
      const t = Date.now()
      const eventOut = timestampDispatchData({event: eventIn, time: t})
      expect(eventOut).to.deep.equal({
        pluginId: PLUGIN_ID,
        timestampedValues: {
          a: {t, v: 1},
          b: {t, v: 2}
        }
      })
    })

    it('passes through already-timestamped data', () => {
      const eventIn = {
        pluginId: PLUGIN_ID,
        timestampedValues: {
          a: {
            t: 1000,
            v: 1
          },
          b: {
            t: 2000,
            v: 2
          }
        }
      }
      const eventOut = timestampDispatchData({event: eventIn, time: 0})
      expect(eventOut).to.deep.equal(eventIn)
    })

    it('merges timestamped and non-timestamped data', () => {
      const PLUGIN_ID = 'testPluginId'
      const eventIn = {
        pluginId: PLUGIN_ID,
        values: {
          a: 1,
          b: 2
        },
        timestampedValues: {
          b: {
            t: 1000,
            v: 3
          },
          c: {
            t: 2000,
            v: 4
          }
        }
      }
      const t = Date.now()
      const eventOut = timestampDispatchData({event: eventIn, time: t})
      expect(eventOut).to.deep.equal({
        pluginId: PLUGIN_ID,
        timestampedValues: {
          a: {t, v: 1},
          b: {t: 1000, v: 3},
          c: {t: 2000, v: 4}
        }
      })
    })
  })
})
