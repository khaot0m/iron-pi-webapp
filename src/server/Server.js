// @flow

import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import {execute, subscribe, GraphQLSchema} from 'graphql'
import {SubscriptionServer} from 'subscriptions-transport-ws'
import Sequelize from 'sequelize'
import type Umzug from 'umzug'
import {defaults} from 'lodash'

import type {$Request, $Response} from 'express'

import createSequelize, {defaultDbConnectionParams} from './sequelize'
import createUmzug from './sequelize/umzug'
import databaseReady from './sequelize/databaseReady'
import sequelizeMigrate from './sequelize/migrate'
import createSchema from './graphql/schema'
import pubsub from './graphql/pubsub'
import {getChannelState, getChannelStates, setChannelStates, setChannelValues} from './localio/ChannelStates'

import logger from '../universal/logger'
import requireEnv from '@jcoreio/require-env'
import type {DbConnectionParams} from './sequelize'
import login from './express/login'
import parseAuthHeader from './express/parseAuthHeader'
import handleGraphql from './express/graphql'
import handleGraphiql from './express/graphiql'
import Channel, {updateChannelState} from './models/Channel'
import authorize from './auth/authorize'
import createToken from './auth/createToken'
import verifyToken from './auth/verifyToken'
import requireAuthHeader from './express/requireAuthHeader'

const log = logger('Server')

/**
 * Wrap server start and stop logic, to make it runnable either from a command line or
 * a testing context
 */
export default class Server {
  _httpServer: ?Object;
  _running: boolean = false
  _devGlobals: Object = {
    Sequelize,
    pubsub,
    getChannelState,
    getChannelStates,
    setChannelStates,
    setChannelValues,
    authorize,
    createToken,
    verifyToken,
  }
  _port: number
  dbConnectionParams: DbConnectionParams
  sequelize: ?Sequelize
  umzug: ?Umzug
  graphqlSchema: ?GraphQLSchema

  constructor(options?: $Shape<DbConnectionParams & {port: number}> = {}) {
    this._port = options.port || parseInt(requireEnv('BACKEND_PORT'))
    const {host, user, database, password} = defaults(options, defaultDbConnectionParams())
    this.dbConnectionParams = {host, user, database, password}
  }

  async start(): Promise<void> {
    if (this._running) return

    log.info('Starting webapp server...')
    try {
      await Promise.all([
        databaseReady(),
      ])

      const sequelize = this.sequelize = this._devGlobals.sequelize = createSequelize(this.dbConnectionParams)
      Object.assign(this._devGlobals, sequelize.models)
      const umzug = this.umzug = this._devGlobals.umzug = createUmzug({sequelize})

      const graphqlSchema = this.graphqlSchema = this._devGlobals.graphqlSchema = createSchema({sequelize})

      const forceMigrate = 'production' !== process.env.NODE_ENV
      if (forceMigrate || process.env.DB_MIGRATE) await sequelizeMigrate({
        sequelize,
        umzug,
      })

      const channels = await Channel.findAll()
      channels.forEach(channel => updateChannelState(channel))

      const app = express()

      app.use((req: Object, res: Object, next: Function) => {
        if (/\/favicon\.?(jpe?g|png|ico|gif)?$/i.test(req.url)) {
          res.status(404).end()
        } else {
          next()
        }
      })

      app.post('/login', bodyParser.json(), login)
      app.use('/verifyToken', requireAuthHeader, parseAuthHeader, (req: $Request, res: $Response) => {
        res.status(req.userId ? 200 : 500).send()
      })
      app.use('/verifyToken', (error: ?Error, req: $Request, res: $Response, next: Function) => {
        if (error) {
          res.status((error: any).statusCode || 500).send(error.message + '\n')
          return
        }
        res.status(req.userId ? 200 : (error: any).statusCode || 500).send()
      })
      if (process.env.BABEL_ENV === 'test') {
        app.post('/createTestToken', bodyParser.json(), require('./express/createTestToken'))
      }

      const GRAPHQL_PATH = '/graphql'
      app.use(GRAPHQL_PATH, parseAuthHeader, bodyParser.json(), handleGraphql({sequelize, schema: graphqlSchema}))
      app.use(GRAPHQL_PATH, (error: ?Error, req: $Request, res: $Response, next: Function) => {
        if (error) {
          res.status((error: any).statusCode || 500).send({error: error.message})
          return
        }
        next(error)
      })

      if (process.env.NODE_ENV !== 'production') {
        app.use('/graphiql', handleGraphiql({endpointURL: GRAPHQL_PATH}))
      }
      app.use('/assets', express.static(path.resolve(__dirname, '..', 'assets')))
      app.use('/static', express.static(path.resolve(__dirname, '..', '..', 'static')))

      // istanbul ignore next
      app.get('/__coverage__', (req: $Request, res: $Response) => {
        if (!req.accepts('application/json')) {
          res.status(500).end()
          return
        }
        const {__coverage__} = global
        if (__coverage__) res.json(__coverage__)
        else res.status(404).end()
      })

      // server-side rendering
      app.get('*', (req: $Request, res: $Response) => {
        require('./ssr/serverSideRender').default(req, res)
      })

      const port = this._port
      const httpServer = this._httpServer = app.listen(port)
      SubscriptionServer.create(
        {schema: graphqlSchema, execute, subscribe},
        {server: httpServer, path: GRAPHQL_PATH},
      )

      // istanbul ignore next
      if (process.env.NODE_ENV !== 'production') {
        Object.assign(global, this._devGlobals)
      }

      log.info(`App is listening on http://0.0.0.0:${port}`)
      this._running = true
    } catch (err) {
      log.error('Could not start server: ' + err.stack)
    }
  }

  // istanbul ignore next
  async stop(): Promise<void> {
    if (!this._running) return
    this._running = false

    if (process.env.NODE_ENV !== 'production') {
      for (let key in this._devGlobals) delete global[key]
    }

    const httpServer = this._httpServer
    if (httpServer) httpServer.close()
    this._httpServer = undefined

    const {sequelize} = this
    if (sequelize) sequelize.close()
  }
}

