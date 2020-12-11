import React from 'react';
import { ViewContainer } from '@daniel.neuweiler/react-lib-module';
import Typography from '@material-ui/core/Typography';

interface ILocalProps {
};
type Props = ILocalProps;

const MapView: React.FC<Props> = (props) => {

  return (

    <ViewContainer
      isScrollLocked={true}>

      <Typography variant="h1">
        {'🚧 Under Construction! 🚧'}
      </Typography>

    </ViewContainer>
  );
}

export default MapView;