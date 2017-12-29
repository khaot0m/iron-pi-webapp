// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles/index'
import {sidebarItemTextStyles} from './SidebarItemText'

import SidebarItem from './SidebarItem'
import SidebarItemText from './SidebarItemText'
import type {ChannelMode} from '../../types/Channel'

export type Channel = {
  id: number,
  name: string,
  mode: ChannelMode,
  value?: {
    current: number,
  },
}

const channelStatusStyles = {
  id: {
    extend: sidebarItemTextStyles.root,
    marginRight: 8,
    flex: '0 1 26px',
  },
}

export type ChannelStatusProps = {
  channel: Channel,
  classes: Object,
}

const ChannelStatusItem = withStyles(channelStatusStyles)(
  ({channel, classes}: ChannelStatusProps): React.Node => (
    <SidebarItem>
      <SidebarItemText data-test-name="id" className={classes.id} primary={String(channel.id)} />
      <SidebarItemText data-test-name="name" disableTypography primary={channel.name} />
    </SidebarItem>
  )
)

export default ChannelStatusItem
