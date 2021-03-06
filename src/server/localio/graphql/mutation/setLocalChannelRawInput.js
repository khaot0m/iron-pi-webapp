// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/GraphQLContext'
import type LocalIODataPlugin from '../../LocalIODataPlugin'

export default function setLocalChannelRawInput({plugin}: {
  plugin: LocalIODataPlugin,
}): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      id: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        description: 'The id of the local channel to set the raw input of',
      },
      rawAnalogInput: {
        type: graphql.GraphQLFloat,
      },
      rawDigitalInput: {
        type: graphql.GraphQLBoolean,
      },
      rawOutput: {
        type: graphql.GraphQLBoolean,
      },
    },
    resolve: (doc: any, args: {id: number, rawAnalogInput?: ?number, rawDigitalInput?: ?boolean, rawOutput?: ?boolean}, context: GraphQLContext): ?boolean => {
      const {userId, scopes} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update LocalIOChannels')
      if (!scopes.has('localio:test:setRawInputs')) {
        throw new graphql.GraphQLError('You do not have permission to set raw inputs')
      }
      plugin._setRawInputValues(args)
    },
  }
}

