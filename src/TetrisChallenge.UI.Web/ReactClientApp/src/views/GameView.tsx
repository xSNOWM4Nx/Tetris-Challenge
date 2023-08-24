import React, { useContext } from 'react';
import { Box, Grid } from '@mui/material';
import { SystemContext, ViewContainer, AutoSizeContainer } from '@daniel.neuweiler/react-lib-module';

import { ViewKeys } from './../navigation';
import GameBoard from './../components/GameBoard';
import { SettingKeys } from './SettingsView';

interface ILocalProps {
}
type Props = ILocalProps;

const ErrorView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.GameView

  // Contexts
  const systemContext = useContext(SystemContext);

  // Get settings
  const showControlPanel = systemContext.getSetting(SettingKeys.ShowControlPanel);

  return (

    <ViewContainer
      isScrollLocked={true}>

      <Grid
        height='100%'
        container={true}>

        <Grid
          item={true}
          lg={6}
          md={12}
          sm={12}
          xs={12}>

          <GameBoard
            borderSpacing={1}
            showControlPanel={showControlPanel} />

        </Grid>
        <Grid
          item={true}
          lg={6}>

          <Box
            sx={{
              height: '100%',
              backgroundColor: 'red'
            }}>

          </Box>
        </Grid>
      </Grid>

    </ViewContainer>
  );
}

export default ErrorView;
