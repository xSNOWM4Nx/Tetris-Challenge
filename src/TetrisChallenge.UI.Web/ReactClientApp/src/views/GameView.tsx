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
          lg={4}
          md={6}
          sm={6}
          xs={6}>

          <AutoSizeContainer
            onRenderSizedChild={renderGameBoard} />
        </Grid>
        <Grid
          item={true}
          lg={4}
          md={6}
          sm={6}
          xs={6}>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              backgroundColor: 'blue'
            }}>

          </Box>
        </Grid>
        <Grid
          item={true}
          sx={{
            display: {
              md: 'none',
              lg: 'block'
            }
          }}
          lg={4}>
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
