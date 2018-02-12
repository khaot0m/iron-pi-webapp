// @flow

import type PluginResources from './PluginResources'
import type {PluginConfig, MappingProblem} from '../../universal/data-router/PluginConfigTypes'

/**
 * Information about a single mapping into or out of a plugin
 */
export type DataPluginMapping = {
  id: string, // Unique ID, e.g. "local1"
  name: string, // Descriptive name for this input or output, e.g. "Local 1". This is distinct from the user settable metadata name, e. g. "Pump 1".
  tagsToPlugin?: ?Array<string>,
  tagFromPlugin?: ?string, // Can be null if this is an output that does not publish a tag back to the tag map
}

export type InputChangeEvent = {
  time: number,
  changedTags: Set<string>,
  tagMap: TimestampedValuesMap,
}

export type CycleDoneEvent = InputChangeEvent & {
  inputsChanged: boolean,
}

/**
 * Interface for a plugin that can send and receive data.
 * DataPlugins may optionally extend EventEmitter, in which case they can
 * emit data by calling this.emit('data', {tag1: value1, tag2: value2})
 */
export interface DataPlugin {
  config(): PluginConfig;
  setConfig(config: PluginConfig): void;
  ioMappings(): Array<DataPluginMapping>;

  /** Called after all plugins have been instantiated and declared their output tags */
  +start?: () => void;

  +inputsChanged?: (event: InputChangeEvent) => void;
  +dispatchCycleDone?: (event: CycleDoneEvent) => void;

  +destroy?: () => void;
}

export type CreatePluginArgs = {
  config: PluginConfig,
  resources: PluginResources,
}

export type CreatePluginFunction = (args: CreatePluginArgs) => DataPlugin

export type TimeValuePair = {
  t: number,
  v: any,
}

export type TimestampedValuesMap = {[tag: string]: TimeValuePair}

export type ValuesMap = {[tag: string]: any}

/**
 * Event that can be fired by calling dataRouter.dispatch(event)
 * Since it is not emitted from a plugin, it must contain the pluginId of the
 * source plugin.
 */
export type DispatchEvent = {
  pluginId: string,
  // The caller can either provide `values` and allow the system to timestamp everything with the current time,
  // or the caller can provide `timestampedValues` if the data has already been timestamped upstream.
  values?: ?ValuesMap,
  timestampedValues?: ?TimestampedValuesMap,
}

/**
 * Dispatch event with only timestamped data
 */
export type TimestampedDispatchEvent = {
  pluginId: string,
  timestampedValues: TimestampedValuesMap,
}


/**
 * Information about a single plugin and all of its mappings
 */
export type PluginAndMappingsInfo = {
  pluginType: string,
  pluginInstanceId: string,
  pluginInstanceName: string,
  mappings: Array<DataPluginMapping>,
}

/**
 * Information on all mappings across all plugins
 */
export type SystemMappingInfo = {
  tagsToProviderPluginIds: Map<string, string>,
  tagsToDestinationPluginIds: Map<string, Set<string>>,
  tags: Array<string>,
  publicTags: Array<string>,
  duplicateTags: Set<string>,
  mappingProblems: Array<MappingProblem>,
}
