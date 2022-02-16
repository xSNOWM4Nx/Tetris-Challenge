import { NavigationTypeEnumeration } from '@daniel.neuweiler/ts-lib-module';
import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';

import ErrorIcon from '@mui/icons-material/Error';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';

export class ViewKeys {

  public static ErrorView: string = 'ErrorView';
  public static GameView: string = 'GameView';
  public static SettingsView: string = 'SettingsView';
  public static LogView: string = 'LogView';
  public static AboutView: string = 'AboutView';
}

export const ViewNavigationElements: { [key: string]: NavigationElementProps } = {
  [ViewKeys.ErrorView]: {
    display: {
      key: "views.errorview.display",
      value: "Uuups"
    },
    key: ViewKeys.ErrorView,
    importPath: "views/ErrorView",
    type: NavigationTypeEnumeration.View,
    icon: ErrorIcon
  },
  [ViewKeys.GameView]: {
    display: {
      key: "views.gameview.display",
      value: "Play"
    },
    key: ViewKeys.GameView,
    importPath: "views/GameView",
    type: NavigationTypeEnumeration.View,
    icon: SportsEsportsIcon
  },
  [ViewKeys.SettingsView]: {
    display: {
      key: "views.settingsview.display",
      value: "Settings"
    },
    key: ViewKeys.SettingsView,
    importPath: "views/SettingsView",
    type: NavigationTypeEnumeration.Dialog,
    icon: SettingsIcon
  },
  [ViewKeys.LogView]: {
    display: {
      key: "views.logview.display",
      value: "Logs"
    },
    key: ViewKeys.LogView,
    importPath: "views/LogView",
    type: NavigationTypeEnumeration.Dialog,
    icon: CodeIcon
  },
  [ViewKeys.AboutView]: {
    display: {
      key: "views.logview.display",
      value: "About"
    },
    key: ViewKeys.AboutView,
    importPath: "views/AboutView",
    type: NavigationTypeEnumeration.Dialog,
    icon: InfoIcon
  }
}
