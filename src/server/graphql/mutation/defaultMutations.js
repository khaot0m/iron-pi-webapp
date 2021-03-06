// @flow

import {Model} from 'sequelize'
import * as graphql from 'graphql'
import {lowerFirst} from 'lodash'
import {createMutation, updateOneMutation, destroyMutation} from '@jcoreio/graphql-sequelize-extra'
import type {GraphQLContext} from '../GraphQLContext'
import {defaultCreateTypeName} from '../types/defaultCreateType'
import {defaultUpdateTypeName} from '../types/defaultUpdateType'

type Options = {
  model: Class<Model<any>>,
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  beforeCreate?: graphql.GraphQLFieldResolver<any, GraphQLContext>,
  beforeUpdateOne?: graphql.GraphQLFieldResolver<any, GraphQLContext>,
  beforeDestroy?: graphql.GraphQLFieldResolver<any, GraphQLContext>,
  requireDefaultScopes?: boolean,
}

export default function defaultMutations(options: Options): graphql.GraphQLFieldConfigMap<any, GraphQLContext> {
  const {model, types, inputTypes, beforeCreate, beforeUpdateOne, beforeDestroy, requireDefaultScopes} = options
  const singular = model.options.name.singular
  const plural = model.options.name.plural
  const requireLoggedIn =
    (source: any, args: any, {userId}: GraphQLContext) => {
      if (userId == null) {
        throw new Error(`You must be logged in to create ${plural}`)
      }
    }
  const defaultScopes = {
    create: `create:${lowerFirst(plural)}`,
    update: `update:${lowerFirst(plural)}`,
    destroy: `destroy:${lowerFirst(plural)}`,
  }
  return {
    [`create${singular}`]: createMutation({
      model,
      inputType: (inputTypes[defaultCreateTypeName(model)]: any),
      returnType: (types[singular]: any),
      before: (source: any, args: any, context: GraphQLContext, info: graphql.GraphQLResolveInfo): any => {
        requireLoggedIn(source, args, context)
        if (requireDefaultScopes && !context.scopes.has(defaultScopes.create)) {
          throw new Error(`You must have ${defaultScopes.create} scope to create ${plural}`)
        }
        if (beforeCreate) return beforeCreate(source, args, context, info)
      },
    }),
    [`update${singular}`]: updateOneMutation({
      model,
      inputType: (inputTypes[defaultUpdateTypeName(model)]: any),
      returnType: (types[singular]: any),
      before: (source: any, args: any, context: GraphQLContext, info: graphql.GraphQLResolveInfo): any => {
        requireLoggedIn(source, args, context)
        if (requireDefaultScopes && !context.scopes.has(defaultScopes.update)) {
          throw new Error(`You must have ${defaultScopes.update} scope to update ${plural}`)
        }
        if (beforeUpdateOne) return beforeUpdateOne(source, args, context, info)
      },
      updateOptions: {individualHooks: true},
    }),
    [`destroy${singular}`]: destroyMutation({
      model,
      before: (source: any, args: any, context: GraphQLContext, info: graphql.GraphQLResolveInfo): any => {
        requireLoggedIn(source, args, context)
        if (requireDefaultScopes && !context.scopes.has(defaultScopes.destroy)) {
          throw new Error(`You must have ${defaultScopes.destroy} scope to destroy ${plural}`)
        }
        if (beforeDestroy) return beforeDestroy(source, args, context, info)
      },
      destroyOptions: {individualHooks: true},
    }),
  }
}
