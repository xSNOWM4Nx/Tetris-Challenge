import React from 'react';
import { Box, Grid } from '@mui/material';
import { ViewContainer, AutoSizeContainer } from '@daniel.neuweiler/react-lib-module';

import { ViewKeys } from './navigation';
import GameBoard from './../components/GameBoard';

interface ILocalProps {
}
type Props = ILocalProps;

const ErrorView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.GameView

  const renderGameBoard = (height: number, width: number) => {

    return (

      <GameBoard
        height={height}
        width={width}
        borderSpacing={1} />
    );
  };

  return (

    <ViewContainer
      isScrollLocked={true}>

      <Grid
        height={'100%'}
        container={true}>

        <Grid
          item={true}
          lg={6}
          md={12}
          sm={12}
          xs={12}>

          <AutoSizeContainer
            renderMode='Direct'
            onRenderSizedChild={renderGameBoard} />
        </Grid>
        <Grid
          item={true}
          sx={{
            display: {
              md: 'none',
              lg: 'block'
            }
          }}
          lg={6}>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              backgroundColor: 'red'
            }}>

          </Box>
        </Grid>
      </Grid>

    </ViewContainer>
  );
}

export default ErrorView;
