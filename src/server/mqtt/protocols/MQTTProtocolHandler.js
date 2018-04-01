// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import type {ValuesFromMQTTMap, DataValueToMQTT, MetadataValueToMQTT} from '../MQTTTypes'

export const EVENT_MQTT_CONNECT = 'connect'
export const EVENT_DATA_FROM_MQTT = 'dataFromMQTT'

export type MQTTProtocolHandlerEmittedEvents = {
  connect: [],
  dataFromMQTT: [ValuesFromMQTTMap],
}

export type MQTTProtocolHandler = EventEmitter<MQTTProtocolHandlerEmittedEvents> & {
  publishData(args: {data: Array<DataValueToMQTT>, time: number}): void,
  publishMetadata(args: {metadata: Array<MetadataValueToMQTT>, data: Array<DataValueToMQTT>, time: number}): void,
  destroy(): void,
}
