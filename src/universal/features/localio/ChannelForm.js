// @flow

import * as React from 'react'
import {FormSection} from 'redux-form'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import Tooltip from 'material-ui/Tooltip'
import {required} from 'redux-form-validators'

import type {Theme} from '../../theme'
import ViewPanel, {ViewPanelBody} from '../../components/ViewPanel'
import ControlWithInfo from '../../components/ControlWithInfo'
import MetadataItemFieldsContainer from '../../components/MetadataItemFieldsContainer'
import {pickMetadataItemFields} from '../../components/MetadataItemFields'
import Spinner from '../../components/Spinner'
import Fader from '../../components/Fader'
import ButtonGroupField from '../../components/ButtonGroupField'

import {ChannelModesArray, getChannelModeDisplayText} from '../../localio/LocalIOChannel'
import type {ChannelMode, LocalIOChannelConfig, LocalIOChannelState} from '../../localio/LocalIOChannel'
import type {MetadataItem} from '../../types/MetadataItem'
import AnalogInputConfigSection from './AnalogInputConfigSection'
import DigitalInputConfigSection from './DigitalInputConfigSection'
import DigitalOutputConfigSection from './DigitalOutputConfigSection'
import DisabledConfigSection from './DisabledConfigSection'
import ChannelStateWidget from './ChannelStateWidget'
import handleError from '../../redux-form/createSubmissionError'
import parseChannelFormValues from './parseChannelFormValues'
import SubmitStatus from '../../components/SubmitStatus'

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
  errorCollapse: {
    marginTop: spacing.unit * 2,
  },
  buttons: {
    textAlign: 'right',
    marginTop: spacing.unit * 2,
    '& > button': {
      minWidth: 120,
    },
    '& > :not(:last-child)': {
      marginRight: spacing.unit * 3,
    }
  },
  tallButton: {
    height: spacing.unit * 7,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

const ConfigComponents: {[mode: ChannelMode]: React.ComponentType<any> | string} = {
  ANALOG_INPUT: AnalogInputConfigSection,
  DIGITAL_INPUT: DigitalInputConfigSection,
  DIGITAL_OUTPUT: DigitalOutputConfigSection,
  DISABLED: DisabledConfigSection,
}

type ControlLogicMetadataItem = {
  tag: string,
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
  metadata?: Array<ControlLogicMetadataItem>,
}

const ConfigSection = (
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

const channelStateInfo: {[name: ChannelMode]: React.Node} = {
  ANALOG_INPUT: (
    <span>
      <p><strong>Raw Input</strong>: Voltage at the physical input</p>
      <p><strong>System Value</strong>: Value after calibration</p>
    </span>
  ),
  DIGITAL_INPUT: (
    <span>
      <p><strong>Raw Input</strong>: Logic level at physical input</p>
      <p><strong>Polarity</strong>: Optionally inverts the input logic level</p>
      <p><strong>System Value</strong>: Value after optional polarity invert step</p>
    </span>
  ),
  DIGITAL_OUTPUT: (
    <span>
      <p><strong>Control Value</strong>: Value being sent to the output, if available</p>
      <p><strong>Safe State</strong>: Value that will be sent to the output if the control value becomes unavailable for any reason</p>
      <p><strong>Polarity</strong>: Optionally inverts the output logic level</p>
      <p><strong>Raw Output</strong>: Value being sent to the physical output</p>
    </span>
  ),
  DISABLED: (
    <span>
      To use this channel, select <strong>Analog Input</strong>, <strong>Digital Input</strong>, or <strong>Digital Output</strong> mode
    </span>
  )
}

type FullChannel = {
  id: number,
  config: LocalIOChannelConfig,
  state?: LocalIOChannelState,
  metadataItem?: MetadataItem,
}

export type Props = {
  id: number,
  loadedId: number,
  classes: Classes,
  initialize: (values: FullChannel, keepDirty?: boolean, otherMeta?: {keepSubmitSucceeded?: boolean}) => any,
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  change?: (field: string, newValue: any) => any,
  config?: {
    mode: ChannelMode,
  },
  data: {
    Channel?: FullChannel & {supportedModes: Array<ChannelMode>},
    Metadata?: Array<ControlLogicMetadataItem>,
    loading?: boolean,
  },
  subscribeToChannelState?: (id: number) => Function,
  handleSubmit: (onSubmit: (values: FullChannel) => any) => (event: Event) => any,
  mutate: (options: {variables: {id?: number, where?: Object, channel: FullChannel}}) => Promise<{
    data: {Channel: FullChannel},
  }>,
}

function _shouldInitialize({data: {Channel}, id, loadedId, pristine}: Props): boolean {
  return Channel != null && Channel.id === id && (pristine || loadedId !== Channel.id)
}

const pickFormFields = ({id, metadataItem, config}: FullChannel) => {
  if (config.mode === 'DISABLED') {
    metadataItem = ((metadataItem ? {...metadataItem} : {}): any)
    if (config.name) metadataItem.name = config.name
  }
  return {id, metadataItem: metadataItem && pickMetadataItemFields(metadataItem), config}
}

export type ChannelModeButtonProps = {
  +value: ChannelMode,
  +disabled?: boolean,
}

class ChannelForm extends React.Component<Props> {
  unsubscribeFromChannelState: ?Function
  initializeTimeout: ?number

  componentDidMount() {
    const {data: {Channel}, initialize, subscribeToChannelState} = this.props
    if (Channel) {
      if (_shouldInitialize(this.props)) {
        this.initializeTimeout = setTimeout(() => initialize(pickFormFields(Channel)), 0)
      }
      if (subscribeToChannelState) {
        this.unsubscribeFromChannelState = subscribeToChannelState(Channel.id)
      }
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const prevChannel = this.props.data.Channel
    const nextChannel = nextProps.data.Channel

    function getId(channel: ?{ id: number }): ?number {
      return channel ? channel.id : null
    }

    if (nextChannel !== prevChannel) {
      if (nextChannel && _shouldInitialize(nextProps)) {
        this.initializeTimeout = setTimeout(() => nextProps.initialize(pickFormFields(nextChannel)), 0)
      }
      if (getId(nextChannel) !== getId(prevChannel)) {
        if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
        if (nextChannel) {
          const {subscribeToChannelState} = nextProps
          if (subscribeToChannelState) {
            this.unsubscribeFromChannelState = subscribeToChannelState(nextChannel.id)
          }
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
    if (Channel) initialize(pickFormFields(Channel))
  }

  handleSubmit = (channel: FullChannel): Promise<void> => {
    const {mutate, initialize} = this.props
    const {id, tag, config, metadataItem} = parseChannelFormValues(channel)
    return mutate({
      variables: {
        where: {id},
        channel: {id, tag, config, metadataItem}
      }
    }).then(({data: {Channel}}: {data: {Channel: FullChannel}}) => {
      initialize(pickFormFields(Channel), false, {keepSubmitSucceeded: true})
    }).catch(err => handleError(err, {
      mapPath: ([first, ...rest]) => [first === 'item' ? 'metadataItem' : first, ...rest],
    }))
  }

  ChannelModeButton = ({value, disabled, ...props}: ChannelModeButtonProps): React.Node => {
    const {data: {Channel}} = this.props
    let supportedModes: Array<ChannelMode> = ['DISABLED']
    if (Channel && Channel.supportedModes) supportedModes = Channel.supportedModes
    const unsupportedMode = supportedModes.indexOf(value) < 0
    const displayText = getChannelModeDisplayText(value)
    const unsupportedLabel = unsupportedMode ? `This channel doesn't support ${displayText} mode` : ''
    const button = (
      <Button
        value={value}
        disabled={disabled || unsupportedMode}
        aria-label={unsupportedLabel}
        {...props}
      >
        {displayText}
      </Button>
    )

    if (unsupportedMode) return (
      <Tooltip title={unsupportedLabel}>
        <div>
          {button}
        </div>
      </Tooltip>
    )

    return button
  }

  render(): React.Node {
    const {
      classes, data: {Metadata, Channel, loading}, initialized, pristine,
      submitting, submitSucceeded, submitFailed, error,
      handleSubmit, change, loadedId, id,
    } = this.props
    const config = this.props.config || {mode: 'DISABLED', systemValue: null}
    if (loading || !initialized || loadedId !== id) {
      return (
        <div className={classes.form}>
          <ViewPanel>
            <ViewPanelBody>
              <Typography variant="subheading">
                <Spinner /> Loading channel configuration...
              </Typography>
            </ViewPanelBody>
          </ViewPanel>
        </div>
      )
    }
    const channelMode: ChannelMode = (Channel && Channel.state ? Channel.state.mode : null) || 'DISABLED'
    return (
      <form id="channelForm" className={classes.form} onSubmit={handleSubmit(this.handleSubmit)}>
        {Channel != null &&
          <ViewPanel>
            <ViewPanelBody>
              <Fader animateHeight>
                <ControlWithInfo
                  info={channelStateInfo[channelMode]}
                  key={channelMode}
                >
                  <ChannelStateWidget channel={Channel} className={classes.formControl} />
                </ControlWithInfo>
              </Fader>
            </ViewPanelBody>
          </ViewPanel>
        }
        <ViewPanel>
          <ViewPanelBody>
            <ControlWithInfo info="The mode of this channel">
              <Field
                name="config.mode"
                component={ButtonGroupField}
                classes={{button: classes.tallButton}}
                availableValues={ChannelModesArray}
                getDisplayText={getChannelModeDisplayText}
                className={classes.formControl}
                validate={required()}
                Button={this.ChannelModeButton}
              />
            </ControlWithInfo>
            {config && config.mode !== 'DISABLED' &&
              <FormSection name="metadataItem">
                <MetadataItemFieldsContainer
                  formControlClass={classes.formControl}
                  force={{
                    dataType: 'number',
                    isDigital: config.mode !== 'ANALOG_INPUT',
                  }}
                />
              </FormSection>
            }
            <ConfigSection
              config={config}
              formControlClass={classes.formControl}
              firstControlClass={classes.firstFaderChild}
              lastControlClass={classes.lastFaderChild}
              tallButtonClass={classes.tallButton}
              metadata={Metadata}
              change={change}
            />
            <SubmitStatus
              submitting={submitting}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              error={error}
            />
            <div className={classes.buttons}>
              <Button
                variant="raised"
                className={classes.tallButton}
                onClick={this.handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="raised"
                color="primary"
                className={classes.tallButton}
                disabled={pristine || submitting}
              >
                Save
              </Button>
            </div>
          </ViewPanelBody>
        </ViewPanel>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ChannelForm)

