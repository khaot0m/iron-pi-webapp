// @flow

import {attributeFields} from 'graphql-sequelize'
import {LocalIOChannelState as GraphQLLocalIOChannelState} from './LocalIOChannelState'
import type {LocalIOChannelState} from '../../../../universal/localio/LocalIOChannel'
import LocalIOChannel from '../../models/LocalIOChannel'
import type {Context} from '../../../graphql/Context'
import * as graphql from 'graphql'
import MetadataItem from '../../../graphql/types/MetadataItem'
import getChannelState from '../../getChannelState'

export default function createLocalIOChannel(options: {
  attributeFieldsCache: Object,
}): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: LocalIOChannel.options.name.singular,
    fields: () => ({
      ...attributeFields(LocalIOChannel, {cache: options.attributeFieldsCache}),
      metadataItem: {
        type: MetadataItem,
        description: 'the metadata item for this channel',
        resolve: ({tag}: LocalIOChannel, args: any, {metadataHandler}: Context) => {
          if (tag) {
            const item = metadataHandler.getTagMetadata(tag)
            return item ? {...item, tag, _id: tag} : null
          }
        },
      },
      name: {
        type: graphql.GraphQLString,
        description: 'the name for this channel',
        resolve: ({id, tag, config}: LocalIOChannel, args: any, {metadataHandler}: Context) => {
          if (!tag) return config.name || `Channel ${id + 1}`
          const item = metadataHandler.getTagMetadata(tag)
          return item ? item.name : `Channel ${id + 1}`
        },
      },
      state: {
        type: GraphQLLocalIOChannelState,
        description: 'the current state of this channel',
        resolve: (channel: LocalIOChannel, args: any, {dataRouter}: Context): ?LocalIOChannelState => {
          return getChannelState(channel, {
            getTagValue: tag => dataRouter.getTagValue(tag),
          })
        }
      },
    }),
  })
}