// @flow

import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type Sequelize, {Model} from 'sequelize'
import mapValues from 'lodash.mapvalues'
import {defaultArgs, attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'
import models from '../../models'
import MetadataItem, {TagDataType} from './MetadataItem'
import MappingProblem, {MappingLocationInfo, MappingProblemKind} from './MappingProblem'
import InputMetadataItem from './InputMetadataItem'
import createUser from './User'

import TimeValuePair from './TimeValuePair'
import TagState from './TagState'
import defaultInputType from './defaultInputType'
import type {GraphQLFeature} from '../GraphQLFeature'
import defaultCreateType from './defaultCreateType'
import defaultUpdateType from './defaultUpdateType'
import NetworkSettings, {InputNetworkSettings} from './NetworkSettings'

export type Options = {
  sequelize: Sequelize,
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createTypes(options: Options): {
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
} {
  const {sequelize, features} = options

  const args = mapValues(models, model => defaultArgs(model))

  function getArgs(model: Class<Model<any>>): Object {
    return args[model.name]
  }

  function getType(model: Class<Model<any>>): Object {
    return types[model.name]
  }

  const extraFields = {
  }

  const attributeFieldsCache = {}

  const types: {[name: string]: GraphQLOutputType} = {
    TimeValuePair,
    TagState,
    TagDataType,
    MetadataItem,
    MappingLocationInfo,
    MappingProblemKind,
    MappingProblem,
    NetworkSettings,
    User: createUser({getType, getArgs, attributeFieldsCache})
  }
  const inputTypes: {[name: string]: GraphQLInputType} = {
    InputMetadataItem,
    InputNetworkSettings,
  }

  for (let key in models) {
    const model = models[key]
    const name = model.options.name.singular
    if (!types[name]) types[name] = new graphql.GraphQLObjectType({
      name,
      fields: () => ({
        ...attributeFields(model, {cache: attributeFieldsCache}),
        ...associationFields(model, {getType, getArgs}),
        ...extraFields[model.name] || {},
      })
    })

    if (!inputTypes[name]) inputTypes[name] = defaultInputType(model, {cache: attributeFieldsCache})

    for (let inputType of [
      defaultCreateType(model, {cache: attributeFieldsCache}),
      defaultUpdateType(model, {cache: attributeFieldsCache}),
    ]) {
      if (!inputTypes[inputType.name]) inputTypes[inputType.name] = inputType
    }
  }

  for (let feature of features) {
    if (feature.addTypes) feature.addTypes({sequelize, types, inputTypes, getType, getArgs, attributeFieldsCache})
  }

  return {types, inputTypes}
}
