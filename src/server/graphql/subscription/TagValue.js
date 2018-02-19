// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import TimeValuePairType from '../types/TaggedTimeValuePair'
import type {TimeValuePair} from '../../data-router/PluginTypes'
import {TAG_VALUE} from './constants'

export default function createTagValue(): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLNonNull(TimeValuePairType),
    description: 'Subscribes to the value of a single tag',
    args: {
      tag: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        description: 'The tag to subscribe to',
      },
    },
    subscribe(doc: any, {tag}: {tag: string}, context: Context): AsyncIterator<TimeValuePair> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to tag values')
      return pubsub.asyncIterator(`${TAG_VALUE}/${tag}`)
    }
  }
}
