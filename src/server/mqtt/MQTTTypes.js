// @flow

import type {MetadataItem} from '../../universal/types/MetadataItem'

export type ValuesFromMQTTMap = {
  [channelId: string]: any,
}

export type ChannelFromMQTTConfig = {
  internalTag: string,
  dataType: 'number' | 'string',
  multiplier?: ?number,
  offset?: ?number,
}

export type DataValueToMQTT = {
  tag: string,
  value: any,
  type: string,
}

export type MetadataValueToMQTT = {
  tag: string,
  metadata: MetadataItem,
}
