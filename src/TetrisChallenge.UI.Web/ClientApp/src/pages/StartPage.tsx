import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ViewInjector } from '@daniel.neuweiler/react-lib-module';
import { ViewNavigationElements } from './../views/navigation';

interface ILocalProps {
  onNavigationError: (sourceName: string, errorMessage: string) => void;
};
type Props = ILocalProps & RouteComponentProps<{}>;

const StartPage: React.FC<Props> = (props) => {

  const navigationElements = ViewNavigationElements.find(e => e.key === "GameView");
  if (!navigationElements) {

    props.onNavigationError('StartPage', 'Navigation error on StartPage. GameView not found.');
    return null;
  };

  return (
    <ViewInjector
      navigationElement={navigationElements}
      onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
  );
}

export default StartPage;