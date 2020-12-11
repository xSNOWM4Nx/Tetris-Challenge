import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';

export const ViewNavigationElements: Array<NavigationElementProps> = [
  {
    display: {
      key: "views.gameview.display",
      value: "Game view"
    },
    key: "GameView",
    importPath: "views/GameView"
  },
  {
    display: {
      key: "views.logview.display",
      value: "Log view"
    },
    key: "LogView",
    importPath: "views/LogView"
  }
]
