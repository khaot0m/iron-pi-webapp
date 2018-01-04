// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Field} from 'redux-form'
import {withStyles, withTheme} from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import Positive from 'material-ui-icons/AddCircleOutline'
import Negative from 'material-ui-icons/RemoveCircleOutline'
import Arrow from 'react-arrow'

import ValueBlock from './ValueBlock'

import type {Theme} from '../../theme'

const LeftArrow = withTheme()(({theme: {channelState: {arrow, block}}, valueFromControl, ...props}: Object) => {
  const {shaftLength, shaftWidth, headLength, headWidth, fill} = arrow
  const width = shaftLength * 2 + headLength
  const height = block.height * 2 + block.padding * 4 + block.spacing + /* border */ 4
  const cy = height / 2
  const vertical = height / 2 + (valueFromControl ? -1 : 1) * (block.spacing + block.height + block.padding + 1) / 2
  const zigX = shaftLength + shaftWidth / 2
  return (
    <svg
      viewBox={`0 0 ${width}, ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{width, height}}
      {...props}
    >
      <path
        d={`M 0,${vertical} L ${zigX},${vertical} L ${zigX},${cy} L ${shaftLength * 2},${cy}`}
        strokeWidth={shaftWidth}
        fill="none"
        stroke={fill}
        strokeLinecap="round"
      />
      <path
        d={`M ${shaftLength * 2},${cy - headWidth / 2} L ${width},${cy} L ${shaftLength * 2},${cy + headWidth / 2} Z`}
        stroke="none"
        fill={fill}
      />
    </svg>
  )
})

const RightArrow = withTheme()(({theme: {channelState: {arrow}}, ...props}: Object) => (
  <Arrow
    direction="right"
    shaftWidth={arrow.shaftWidth}
    shaftLength={arrow.shaftLength}
    headWidth={arrow.headWidth}
    headLength={arrow.headLength}
    fill={arrow.fill}
    {...props}
  />
))

const polaritySectionStyles = ({palette, spacing}: Theme) => ({
  root: {
    position: 'relative',
  },
  title: {
    position: 'absolute',
    top: spacing.unit,
    transform: 'translateY(-100%)',
    margin: 0,
    fontSize: '1rem',
    fontWeight: 400,
    color: palette.grey[600],
  },
  icon: {
    color: palette.grey[600],
    display: 'block',
    margin: '0 auto',
    fontSize: '2.5rem',
  }
})

type PolaritySectionClasses = $Call<ExtractClasses, typeof polaritySectionStyles>

export type PolaritySectionProps = {
  classes: PolaritySectionClasses,
  input: {
    value?: boolean,
    onChange: (newValue: boolean) => any,
  },
}

const PolaritySection = withStyles(polaritySectionStyles, {withTheme: true})(
  ({classes, input: {value, onChange}}: PolaritySectionProps) => (
    <div className={classes.root}>
      <h4 className={classes.title}>
        Polarity
      </h4>
      <IconButton className={classes.icon} onClick={() => onChange(!value)}>
        {value
          ? <Negative />
          : <Positive />
        }
      </IconButton>
    </div>
  )
)

const styles = ({spacing, channelState: {block}}: Theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    margin: spacing.unit,
  },
  inputBlockHolder: {
    display: 'inline-flex',
    flexDirection: 'column',
    flexGrow: 1,
    '& > :not(:last-child)': {
      marginBottom: block.spacing,
    }
  },
  block: {
    height: block.height,
    minWidth: spacing.unit * 12,
  },
  valueBlock: {
    flexGrow: 1,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
  controlValue?: number,
  safeState?: number,
  rawOutput?: number,
}

const DigitalOutputState = (
  ({classes, className, controlValue, safeState, rawOutput}: Props) => (
    <div className={classNames(classes.root, className)}>
      <div className={classes.inputBlockHolder}>
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          title="Control Value"
          value={controlValue != null && Number.isFinite(controlValue) ? controlValue.toFixed(0) : null}
        />
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          title="Safe State"
          value={safeState != null && Number.isFinite(safeState) ? safeState.toFixed(0) : null}
        />
      </div>
      <LeftArrow className={classes.arrow} />
      <Field
        name="config.reversePolarity"
        component={PolaritySection}
      />
      <RightArrow className={classes.arrow} />
      <ValueBlock
        className={classNames(classes.block, classes.valueBlock)}
        title="Raw Output"
        value={rawOutput != null && Number.isFinite(rawOutput) ? rawOutput.toFixed(0) : null}
      />
    </div>
  )
)

export default withStyles(styles, {withTheme: true})(DigitalOutputState)

