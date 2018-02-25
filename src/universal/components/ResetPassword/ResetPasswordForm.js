// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import {Field} from 'redux-form'
import {TextField} from 'redux-form-material-ui'
import type {Theme} from '../../theme'
import Fader from '../Fader'
import Spinner from '../Spinner'
import ViewSlider from 'react-view-slider/lib/simpleWithTransitionContext'
import {required, confirmation} from '@jcoreio/redux-form-validators'
import Autocollapse from '../Autocollapse'
import ErrorAlert from '../ErrorAlert'

const styles = ({spacing, palette, typography}: Theme) => ({
  root: {
  },
  title: {
    marginBottom: spacing.unit,
  },
  stepNumber: {
    marginTop: spacing.unit,
    fontSize: typography.pxToRem(14),
    color: palette.text.hint,
  },
  stepFader: {
    display: 'inline-block',
  },
  step: {
    minHeight: 80,
  },
  formControl: {
    width: '100%',
  },
  footer: {
    marginTop: spacing.unit * 2,
    textAlign: 'right',
    '& > :not(:first-child)': {
      marginLeft: spacing.unit,
    }
  },
  footerButton: {
    padding: `${spacing.unit}px ${spacing.unit * 5}px`,
  },
})


type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  submitting?: boolean,
  step: 1 | 2 | 3,
  error?: string,
  title?: React.Node,
  onSubmit?: (event: Event) => any,
  onCancel?: () => any,
}

const validateRetypeNewPassword = [required(), confirmation({
  field: 'newPassword',
  fieldLabel: 'New Password',
})]

const Step1 = (props) => (
  <div {...props}>
    Press the {'"Connect"'} button on the Iron Pi...
  </div>
)

const Step2 = ({classes, ...props}: {classes: Classes}) => (
  <div {...props}>
    <Field
      type="text"
      name="accessCode"
      label="Enter the Access Code printed on the Iron Pi:"
      component={TextField}
      validate={required()}
      className={classes.formControl}
    />
  </div>
)

const Step3 = ({classes, ...props}: {classes: Classes}) => (
  <div {...props}>
    <Field
      type="password"
      name="newPassword"
      label="New Password"
      component={TextField}
      validate={required()}
      className={classes.formControl}
    />
    <Field
      type="password"
      name="retypeNewPassword"
      label="Retype New Password"
      component={TextField}
      validate={validateRetypeNewPassword}
      className={classes.formControl}
    />
  </div>
)

const Steps = [Step1, Step2, Step3]

const ResetPasswordForm = ({classes, onSubmit, onCancel, submitting, step, title, error}: Props) => {
  const Step = Steps[step - 1]
  return (
    <form className={classes.root} onSubmit={onSubmit}>
      <h3 className={classes.title}>{title || 'Reset Password'}</h3>
      <h4 className={classes.stepNumber}>
        Step <Fader className={classes.stepFader}>{step}</Fader> of 3
      </h4>
      <Autocollapse>
        {error ? <ErrorAlert data-test-name="submitError">{error}</ErrorAlert> : null}
      </Autocollapse>
      <ViewSlider>
        <Step key={step} classes={classes} className={classes.step} />
      </ViewSlider>
      <div className={classes.footer}>
        {submitting && <Spinner />}
        <Button raised className={classes.footerButton} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" raised color="primary" className={classes.footerButton} disabled={step === 1 || submitting}>
          Next
        </Button>
      </div>
    </form>
  )
}

export default withStyles(styles, {withTheme: true})(ResetPasswordForm)
