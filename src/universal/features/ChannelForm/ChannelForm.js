// @flow

import * as React from 'react'
import Paper from 'material-ui/Paper'
import {formValues} from 'redux-form'
import {Field} from 'redux-form-normalize-on-blur'
import {TextField} from 'redux-form-material-ui'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {required} from '@jcoreio/redux-form-validators'

import type {Theme} from '../../theme'
import ControlWithInfo from '../../components/ControlWithInfo'
import Spinner from '../../components/Spinner'
import Fader from '../../components/Fader'
import ButtonGroupField from '../../components/ButtonGroupField'

import {ChannelModesArray, getChannelModeDisplayText} from '../../types/Channel'
import type {ChannelMode, Channel as FullChannel} from '../../types/Channel'
import AnalogInputConfigSection from './AnalogInputConfigSection'
import DigitalInputConfigSection from './DigitalInputConfigSection'
import DigitalOutputConfigSection from './DigitalOutputConfigSection'
import ChannelStateWidget from './ChannelStateWidget'
import handleError from '../../redux-form/createSubmissionError'
import parseChannelFormValues from './parseChannelFormValues'

const styles = ({spacing}: Theme) => ({
  form: {
    margin: '0 auto',
    minWidth: 570 + spacing.unit * 4,
    maxWidth: 570 + spacing.unit * 4,
  },
  formControl: {
    width: '100%',
  },
  firstFaderChild: {
    marginTop: 0,
  },
  lastFaderChild: {
    marginBottom: 0,
  },
  buttons: {
    textAlign: 'right',
    marginTop: spacing.unit * 2,
    '& > *': {
      minWidth: 120,
    },
    '& > :not(:last-child)': {
      marginRight: spacing.unit * 3,
    }
  },
  tallButton: {
    height: spacing.unit * 7,
  },
  paper: {
    padding: `${spacing.unit * 2}px ${spacing.unit * 4}px`,
    margin: spacing.unit * 2,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

const trim = (value: ?string) => value && value.trim()

const Empty = () => <div />

const ConfigComponents: {[mode: ChannelMode]: React.ComponentType<any> | string} = {
  ANALOG_INPUT: AnalogInputConfigSection,
  DIGITAL_INPUT: DigitalInputConfigSection,
  DIGITAL_OUTPUT: DigitalOutputConfigSection,
  DISABLED: Empty,
}

type Channel = {
  id: number,
  name: string,
}

export type ConfigSectionProps = {
  config: {
    mode: ChannelMode,
  },
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  tallButtonClass: string,
  channels?: Array<Channel>,
}

const ConfigSection = formValues('config')(
  ({config, ...props}: ConfigSectionProps): React.Node => {
    const mode = config && config.mode || 'DISABLED'
    return (
      <Fader animateHeight>
        <div key={mode}>
          {mode ? React.createElement(ConfigComponents[mode], {key: mode, ...props}) : ''}
        </div>
      </Fader>
    )
  }
)

export type Props = {
  classes: Classes,
  initialize: (values: FullChannel) => any,
  initialized?: boolean,
  submitting?: boolean,
  pristine?: boolean,
  data: {
    Channel?: FullChannel,
    Channels?: Array<Channel>,
    loading?: boolean,
  },
  subscribeToChannelState?: (id: number) => Function,
  handleSubmit: (onSubmit: (values: FullChannel) => any) => (event: Event) => any,
  mutate: (options: {variables: {channel: FullChannel}}) => Promise<void>,
}

class ChannelForm extends React.Component<Props> {
  unsubscribeFromChannelState: ?Function
  initializeTimeout: ?number

  pickFormFields = ({id, channelId, name, config}: FullChannel) => ({id, channelId, name, config})

  componentDidMount() {
    const {data: {Channel}, initialize, subscribeToChannelState} = this.props
    if (Channel) {
      this.initializeTimeout = setTimeout(() => initialize(this.pickFormFields(Channel)), 0)
      if (subscribeToChannelState) {
        this.unsubscribeFromChannelState = subscribeToChannelState(Channel.id)
      }
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevChannel = this.props.data.Channel
    const nextChannel = nextProps.data.Channel

    if (nextChannel !== prevChannel) {
      if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
      if (nextChannel) {
        this.initializeTimeout = setTimeout(() => nextProps.initialize(this.pickFormFields(nextChannel)), 0)
        const {subscribeToChannelState} = nextProps
        if (subscribeToChannelState) {
          this.unsubscribeFromChannelState = subscribeToChannelState(nextChannel.id)
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.initializeTimeout != null) clearTimeout(this.initializeTimeout)
    if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
  }

  handleCancel = () => {
    const {data: {Channel}, initialize} = this.props
    if (Channel) initialize(this.pickFormFields(Channel))
  }

  handleSubmit = (channel: FullChannel): Promise<void> => {
    const {mutate} = this.props
    const {id, channelId, name, config} = parseChannelFormValues(channel)
    return mutate({variables: {channel: {id, channelId, name, config}}}).catch(handleError)
  }

  render(): React.Node {
    const {classes, data: {Channels, Channel, loading}, initialized, pristine, submitting, handleSubmit} = this.props
    if (loading || !initialized) {
      return (
        <div className={classes.form}>
          <Paper className={classes.paper}>
            <Typography type="subheading">
              <Spinner /> Loading channel configuration...
            </Typography>
          </Paper>
        </div>
      )
    }
    return (
      <form id="channelForm" className={classes.form} onSubmit={handleSubmit(this.handleSubmit)}>
        {Channel &&
          <Paper className={classes.paper}>
            <Fader animateHeight>
              <ControlWithInfo
                info="The current state of the channel"
                key={Channel.state && Channel.state.mode || 'DISABLED'}
              >
                <ChannelStateWidget channel={Channel} className={classes.formControl} />
              </ControlWithInfo>
            </Fader>
          </Paper>
        }
        <Paper className={classes.paper}>
          <ControlWithInfo info="The mode of the channel">
            <Field
              name="config.mode"
              component={ButtonGroupField}
              buttonClassName={classes.tallButton}
              availableValues={ChannelModesArray}
              activeButtonProps={{accent: true}}
              getDisplayText={getChannelModeDisplayText}
              className={classes.formControl}
              validate={required()}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The name of the channel">
            <Field
              name="name"
              label="Channel Name"
              type="text"
              component={TextField}
              className={classes.formControl}
              validate={required()}
              normalize={trim}
            />
          </ControlWithInfo>
          <ControlWithInfo info="The internal id of the channel">
            <Field
              name="channelId"
              label="Channel ID"
              type="text"
              component={TextField}
              className={classes.formControl}
              validate={required()}
              normalize={trim}
            />
          </ControlWithInfo>
          <ConfigSection
            formControlClass={classes.formControl}
            firstControlClass={classes.firstFaderChild}
            lastControlClass={classes.lastFaderChild}
            tallButtonClass={classes.tallButton}
            channels={Channels}
          />
          <div className={classes.buttons}>
            <Button
              raised
              className={classes.tallButton}
              onClick={this.handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              raised
              color="primary"
              className={classes.tallButton}
              disabled={pristine || submitting}
            >
              OK
            </Button>
          </div>
        </Paper>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ChannelForm)

