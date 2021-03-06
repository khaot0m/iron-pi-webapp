// @flow

import {createMuiTheme} from 'material-ui/styles'
import red from 'material-ui/colors/red'

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Breakpoints = {
  between: (start: BreakpointKey, end: BreakpointKey) => string,
  down: (key: BreakpointKey) => string,
  up: (key: BreakpointKey) => string,
  only: (key: BreakpointKey) => string,
  keys: Array<BreakpointKey>,
  width: (key: BreakpointKey) => number,
  values: {[key: BreakpointKey]: number},
}

type TypographyCategory = {
  color: string,
  fontFamily: string,
  fontSize: number | string,
  fontWeight: number,
  letterSpacing?: number | string,
  lineHeight: number | string,
  marginLeft?: number | string,
}

export type Palette = {
  [50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900]: string,
  A100: string,
  A200: string,
  A400: string,
  A700: string,
  constrastDefaultColor: 'light' | 'dark',
  light: string,
  main: string,
  dark: string,
}

export type Theme = {
  direction: 'ltr' | 'rtl',
  breakpoints: Breakpoints,
  palette: {
    background: {
      appBar: string,
      chip: string,
      contentFrame: string,
      default: string,
      paper: string,
      parentPaper: string,
      sidebar: string,
      loginDialog: {
        header: string,
      },
      opaqueBackdrop: string,
      valueBlock: {
        ok: string,
      },
    },
    text: {
      disabled: string,
      hint: string,
      icon: string,
      primary: string,
      secondary: string,
    },
    action: {
      active: string,
      hover: string,
      selected: string,
      disabled: string,
      disabledBackground: string,
    },
    divider: string,
    grey: Palette,
    primary: Palette,
    secondary: Palette,
    error: Palette,
    success: Palette,
    infoIcon: string,
  },
  shadows: Array<string>,
  stripedList: Object,
  defaultTable: Object,
  sidebar: {
    width: number,
    padding: {
      vertical: number,
      horizontal: number,
    },
    transition: {
      timingFunction: string,
      duration: string,
    },
    backgroundColor: string,
    foregroundColor: string,
    autoOpenBreakpoint: () => number,
    isAutoOpen: (viewportWidth: number) => boolean,
  },
  alert: {
    success: {
      backgroundColor: string,
      border: {
        width: number,
        style: string,
        color: string,
      },
    },
    warning: {
      backgroundColor: string,
      border: {
        width: number,
        style: string,
        color: string,
      },
    },
    error: {
      backgroundColor: string,
      border: {
        width: number,
        style: string,
        color: string,
      },
    },
  },
  navbar: {
    title: {
      color: string,
      fontSize: string,
      fontWeight: number,
      textAlign: string,
      lineHeight: string,
    },
  },
  statusPanel: {
    title: {
      color: string,
      fontSize: string,
      fontWeight: number,
      textAlign: string,
      lineHeight: string,
    },
  },
  viewPanel: {
    root: Object,
    body: Object,
    title: Object,
    noVerticalPadding: Object,
  },
  calibration: {
    title: {
      color: string,
      fontSize: string,
      fontWeight: number,
      textAlign: string,
      lineHeight: string,
    },
  },
  jcoreLogo: {
    color: string,
    fontFamily: string,
    fontSize: string,
    lineHeight: string,
    fontWeight: number,
  },
  ironPiLogo: {
    color: string,
    fontFamily: string,
    fontSize: string,
    lineHeight: string,
    fontWeight: number,
    textTransform?: string,
  },
  spacing: {
    unit: number,
  },
  channelState: {
    on: string,
    off: string,
    warning: string,
    arrow: {
      fill: string,
      shaftWidth: number,
      shaftLength: number,
      longShaftLength: number,
      headWidth: number,
      headLength: number,
    },
    block: {
      height: number,
      spacing: number,
      padding: number,
    },
    polarityIcon: {
      color: string,
      width: string,
      height: string,
    },
  },
  typography: {
    body1: TypographyCategory,
    body2: TypographyCategory,
    button: TypographyCategory,
    caption: TypographyCategory,
    display1: TypographyCategory,
    display2: TypographyCategory,
    display3: TypographyCategory,
    display4: TypographyCategory,
    headline: TypographyCategory,
    subheading: TypographyCategory,
    title: TypographyCategory,
    fontFamily: string,
    fontSize: number | string,
    fontWeightLight: number,
    fontWeightMedium: number,
    fontWeightRegular: number,
    pxToRem: (value: number) => string,
  },
  zIndex: {
    appBar: string,
    dialog: string,
    dialogOverlay: string,
    drawerOverlay: string,
    layer: string,
    menu: string,
    mobileStepper: string,
    navDrawer: string,
    popover: string,
    snackbar: string,
    tooltip: string,
  },
  overrides: {
    MuiButton?: {
      root?: Object,
      raised?: Object,
      raisedAccent?: Object,
    },
    MuiInput: {
      root: {
        fontSize: string,
        fontWeight: number,
      },
    },
    MuiSelect?: {
      select?: Object,
      selectMenu?: Object,
    },
    MuiFormLabel?: {
      root?: Object,
    },
    MuiInputLabel?: {
      shrink?: Object,
    },
  },
}

const darkBackground = '#333e47'

const theme: Theme = createMuiTheme({
  spacing: {unit: 8},
  palette: {
    background: {
      appBar: '#fff',
      contentFrame: '#eef1f1',
      parentPaper: '#f7f7f7',
      sidebar: darkBackground,
      loginDialog: {
        header: darkBackground,
      },
      opaqueBackdrop: '#eef1f1',
      valueBlock: {
        ok: '#f1fcea',
      },
    },
    primary: {
      [50]: '#eaeff3',
      [100]: '#cad7e2',
      [200]: '#a7bdce',
      [300]: '#84a2ba',
      [400]: '#698eac',
      [500]: '#4f7a9d',
      [600]: '#487295',
      [700]: '#3f678b',
      [800]: '#365d81',
      [900]: '#264a6f',
      A100: '#b2d7ff',
      A200: '#7fbcff',
      A400: '#4ca1ff',
      A700: '#3393ff',
      'contrastDefaultColor': 'light',
    },
    secondary: {
      [50]: '#fff7e0',
      [100]: '#ffecb3',
      [200]: '#ffdf80',
      [300]: '#ffd24d',
      [400]: '#ffc826',
      [500]: '#ffbe00',
      [600]: '#ffb800',
      [700]: '#ffaf00',
      [800]: '#ffa700',
      [900]: '#ff9900',
      A100: '#ffecc7',
      A200: '#ffdc99',
      A400: '#ffcf5c',
      A700: '#ffbe00',
      'contrastDefaultColor': 'dark',
    },
    error: red,
    success: {
      light: '#d3eec1',
      main: '#5dba54',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.8)',
      // includes form labels
      secondary: 'rgba(0, 0, 0, 0.7)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
    input: {
      inputText: 'rgba(0, 0, 0, 0.61)',
      labelText: 'rgba(0, 0, 0, 0.5)',
      helperText: 'rgba(0, 0, 0, 0.5)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    // The colors used to style the action elements.
    action: {
      // The color of an active action like an icon button.
      active: 'rgba(0, 0, 0, 0.64)',
      // The color of an hovered action.
      hover: 'rgba(0, 0, 0, 0.08)',
      // The color of a selected action.
      selected: 'rgba(0, 0, 0, 0.14)',
      // The color of a disabled action.
      disabled: 'rgba(0, 0, 0, 0.26)',
      // The background color of a disabled action.
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    infoIcon: '#ccc',
  },
  typography: {
    fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    button: {
      fontSize: 18,
      fontWeight: 500,
      textTransform: 'none',
      lineHeight: '23px',
    },
  },
})

theme.stripedList = {
  transition: 'background-color ease 0.1s',
  '&:nth-child(odd)': {
    backgroundColor: theme.palette.grey[200],
  },
  '&:nth-child(even)': {
    backgroundColor: theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
  },
}

theme.alert = {
  success: {
    color: '#3c763d',
    backgroundColor: '#dff0d8',
    border: {
      width: 1,
      style: 'solid',
      color: '#d0e9c6',
    },
  },
  warning: {
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    border: {
      width: 1,
      style: 'solid',
      color: '#faf2cc',
    },
  },
  error: {
    color: '#a94442',
    backgroundColor: '#f2dede',
    border: {
      width: 1,
      style: 'solid',
      color: '#ebcccc',
    },
  },
}

theme.jcoreLogo = {
  fontFamily: 'Rubik',
  color: theme.palette.secondary[500],
  fontSize: theme.typography.pxToRem(32),
  lineHeight: theme.typography.pxToRem(38),
  fontWeight: 300,
}
theme.ironPiLogo = {
  fontFamily: 'Rubik',
  color: '#d3d3d3',
  fontSize: theme.typography.pxToRem(22),
  lineHeight: theme.typography.pxToRem(27),
  fontWeight: 300,
  textTransform: 'uppercase',
}
theme.sidebar = {
  width: 256,
  padding: {
    horizontal: 22,
    vertical: 10,
  },
  transition: {
    duration: '250ms',
    timingFunction: 'ease',
  },
  backgroundColor: '#333e47',
  foregroundColor: '#d3d3d3',
  autoOpenBreakpoint: (): number => theme.breakpoints.values.md,
  isAutoOpen: (viewportWidth: number): boolean => viewportWidth >= theme.sidebar.autoOpenBreakpoint(),
}
theme.navbar = {
  title: {
    color: '#3f4349',
    textAlign: 'center',
    fontSize: theme.typography.pxToRem(26),
    fontWeight: 500,
    lineHeight: theme.typography.pxToRem(32),
  },
}

const viewPanelPadding = {
  vertical: theme.spacing.unit * 2,
  horizontal: theme.spacing.unit * 4,
}
theme.viewPanel = {
  root: {
    maxWidth: 600,
    margin: `${theme.spacing.unit * 2}px auto`,
  },
  body: {
    padding: {
      top: viewPanelPadding.vertical,
      bottom: viewPanelPadding.vertical,
      left: viewPanelPadding.horizontal,
      right: viewPanelPadding.horizontal,
    },
  },
  noVerticalPadding: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  title: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(20),
    margin: 0,
    padding: {
      top: viewPanelPadding.vertical,
      left: viewPanelPadding.horizontal,
      right: viewPanelPadding.horizontal,
      bottom: viewPanelPadding.vertical / 2,
    },
    borderBottom: {
      width: 2,
      style: 'solid',
      color: theme.palette.text.primary,
    },
  },
}
theme.statusPanel = {
  title: {
    color: '#323232',
    textAlign: 'left',
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 500,
    lineHeight: theme.typography.pxToRem(29),
    margin: 0,
    padding: theme.viewPanel.title.padding,
  },
}

theme.defaultTable = {
  borderCollapse: 'separate',
  '& > thead': {
    '& > tr:first-child': {
      height: theme.spacing.unit * 4,
      '& > th': {
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit / 2,
        color: theme.palette.text.primary,
        fontSize: theme.typography.pxToRem(20),
        borderBottom: {
          width: 2,
          style: 'solid',
          color: theme.palette.grey[500],
        },
      },
    },
    '& > tr:not(:first-child)': {
      height: theme.spacing.unit * 3,
      '& > th': {
        color: theme.palette.text.secondary,
        fontSize: theme.typography.pxToRem(15),
      },
    },
  },
  '& > tbody > tr': {
    height: theme.spacing.unit * 4,
    ...theme.stripedList,
  },
  '& td, & th': {
    padding: theme.spacing.unit / 2,
    verticalAlign: 'middle',
  },
  '& td:first-child, & th:first-child': {
    paddingLeft: viewPanelPadding.horizontal,
  },
  '& td:last-child, & th:last-child': {
    paddingRight: viewPanelPadding.horizontal,
  },
  '& td': {
    fontSize: theme.typography.pxToRem(18),
    border: 'none',
  },
}

theme.channelState = {
  on: theme.palette.success.main,
  off: '#d8d8d8',
  warning: '#e2a000',
  arrow: {
    fill: theme.palette.primary.A100,
    shaftWidth: theme.spacing.unit * 1.5,
    shaftLength: theme.spacing.unit * 3,
    longShaftLength: theme.spacing.unit * 6,
    headWidth: theme.spacing.unit * 2.1,
    headLength: theme.spacing.unit * 1.7,
  },
  block: {
    height: theme.spacing.unit * 6,
    spacing: theme.spacing.unit,
    padding: theme.spacing.unit / 2,
  },
  polarityIcon: {
    color: theme.palette.grey[500],
    width: '2.5rem',
    height: '2.5rem',
  },
}
theme.calibration = {
  title: {
    color: theme.palette.grey[700],
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 500,
    lineHeight: theme.typography.pxToRem(29),
    textAlign: 'left',
  },
}

theme.overrides = {
  MuiButton: {
    root: {
      ...theme.typography.button,
      padding: `${theme.spacing.unit / 2}px ${theme.spacing.unit * 2}px`,
      borderRadius: 0,
    },
    raised: {
      color: theme.palette.text.primary,
    },
  },
  MuiInput: {
    root: {
      fontSize: theme.typography.pxToRem(20),
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  MuiSelect: {
    // see https://github.com/mui-org/material-ui/issues/9826
    select: {
      padding: undefined,
      paddingRight: theme.spacing.unit * 4,
      height: undefined,
    },
    selectMenu: {
      lineHeight: undefined,
    },
  },
  MuiFormLabel: {
    root: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  MuiInputLabel: {
    shrink: {
      transform: 'translate(0, 1.5px)',
    },
  },
  MuiTooltip: {
    tooltip: {
      [theme.breakpoints.down('xs')]: {
        fontSize: theme.typography.pxToRem(12),
      },
      [theme.breakpoints.up('sm')]: {
        fontSize: theme.typography.pxToRem(14),
      }
    },
  },
}

export default theme

