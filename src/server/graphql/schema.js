// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'

import createTypes from './types'
import createQuery from './query'
import createMutation from './mutation'
import createSubscription from './subscription'
import type {GraphQLFeature} from './GraphQLFeature'

export type Options = {
  sequelize: Sequelize,
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createSchema(options: Options): graphql.GraphQLSchema {
  const {sequelize, features} = options

  const {types, inputTypes} = createTypes({sequelize, features})

  return new graphql.GraphQLSchema({
    query: createQuery({sequelize, types, features}),
    mutation: createMutation({sequelize, types, inputTypes, features}),
    subscription: createSubscription({sequelize, types, features}),
  })
}

