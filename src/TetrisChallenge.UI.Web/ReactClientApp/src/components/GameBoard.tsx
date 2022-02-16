import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Fab } from '@mui/material';

import {
  IGameBoardBlock, getGameBoard, getGameBoardRow, getGameSession, GameConstants, IGameSession, GameStateEnumeration,
  ITetrominoBlock, TetrominoList, getFilledRows
} from './../types';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface ILocalProps {
  height: number;
  width: number;
  borderSpacing?: number;
  backgroundColor?: string;
}
type Props = ILocalProps;

const GameBoard: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'GameBoard';
  const borderSpacing = (props.borderSpacing !== undefined) ? props.borderSpacing : 0
  const controlPanelHeight = 192;

  // States
  const [blockSize, setBlockSize] = useState(0);
  const [gameBoard, setGameBoard] = useState<Array<Array<IGameBoardBlock>>>(getGameBoard(GameConstants.BlockCountHeight, GameConstants.BlockCountWidth));
  const [gameState, setGameState] = useState<GameStateEnumeration>(GameStateEnumeration.Init);
  const [gameSession, setGameSession] = useState<IGameSession>(getGameSession());
  const [tetrominoQueue, setTetrominoQueue] = useState<Array<ITetrominoBlock>>([]);
  const [activeTetromino, setActiveTetromino] = useState<ITetrominoBlock | null>(null);

  // Refs
  const gameTickIdRef = useRef(0);
  const playTimeTickIdRef = useRef(0);

  const gameBoardRef = useRef(gameBoard);
  gameBoardRef.current = gameBoard;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const gameSessionRef = useRef(gameSession);
  gameSessionRef.current = gameSession;

  const tetrominoQueueRef = useRef(tetrominoQueue);
  tetrominoQueueRef.current = tetrominoQueue;

  const activeTetrominoRef = useRef(activeTetromino);
  activeTetrominoRef.current = activeTetromino;

  // Effects
  useEffect(() => {

    // Mount
    // document.addEventListener("keydown", handleKeyDown, false);
    // document.addEventListener("keyup", handleKeyUp, false);

    fillTetrominoQueue();
    play();

    // Unmount
    return () => {

      // document.removeEventListener("keydown", handleKeyDown, false);
      // document.removeEventListener("keyup", handleKeyUp, false);

      // Clear handles
      clearTimeout(gameTickIdRef.current);
      clearInterval(playTimeTickIdRef.current);
    }
  }, []);
  useEffect(() => {

    var blockHeightSize =
      Math.floor((props.height - controlPanelHeight) / GameConstants.BlockCountHeight) -
      (borderSpacing * 2);

    var blockWidthSize =
      Math.floor(props.width / GameConstants.BlockCountWidth) -
      (borderSpacing * 2);

    var newBlockSize = blockHeightSize;
    if (newBlockSize > blockWidthSize)
      newBlockSize = blockWidthSize;

    setBlockSize(newBlockSize);

  }, [props.width, props.height]);
  useEffect(() => {

    switch (gameStateRef.current) {
      case GameStateEnumeration.Error: {

        break;
      }
      case GameStateEnumeration.GameOver: {

        break;
      }
      case GameStateEnumeration.Spawning: {

        spawnTetromino();
        resetGameTick();
        break;
      }
      case GameStateEnumeration.HardDrop: {

        hardDropTetromino();
        break;
      }
    }

  }, [gameStateRef.current]);

  const play = () => {

    setGameState(GameStateEnumeration.Idle);
    gameTickIdRef.current = window.setTimeout(onGameTick, gameSessionRef.current.speedTick);
  };

  const pause = () => {
    setGameState(GameStateEnumeration.Paused);
  };

  const resetGameTick = (tick?: number) => {

    clearTimeout(gameTickIdRef.current);

    var speedTick = (tick !== undefined) ? tick : gameSessionRef.current.speedTick;
    gameTickIdRef.current = window.setTimeout(onGameTick, speedTick);
  };

  const onGameTick = () => {

    if (gameStateRef.current !== GameStateEnumeration.Idle) {

      // Clear handles
      clearTimeout(gameTickIdRef.current);
      return;
    };

    // Check for spawning
    if (activeTetrominoRef.current === null) {

      setGameState(GameStateEnumeration.Spawning);
      clearTimeout(gameTickIdRef.current);
      return;
    };

    if (activeTetrominoRef.current !== null &&
      gameStateRef.current === GameStateEnumeration.Idle) {

      if (!moveTetromino(activeTetrominoRef.current, 0, 0, 1)) {

        if (!fixTetromino()) {

          setGameState(GameStateEnumeration.Error);
          clearTimeout(gameTickIdRef.current);
        };
      };
    };

    // Reset game tick
    resetGameTick();
  };

  const clearGameBoard = (clearType: 'All' | 'NonFilled') => {

    gameBoardRef.current.forEach((blockRow, rowIndex) => {
      blockRow.forEach(block => {

        switch (clearType) {
          case 'All': {

            block.isFilled = false;
            block.style = {
              backgroundColor: 'inherit'
            };
            break;
          }
          case 'NonFilled': {

            if (!block.isFilled)
              block.style = {
                backgroundColor: 'inherit'
              };
            break;
          }
        }
      })
    })

    setGameBoard([...gameBoardRef.current]);
  };

  const fillTetrominoQueue = (replaceAll?: boolean) => {

    var tetrominoQueueCopy = [...tetrominoQueue];
    if (replaceAll)
      tetrominoQueueCopy = [];

    while (tetrominoQueueCopy.length < GameConstants.TetrominoQueueLength) {

      var range = TetrominoList.length;
      var tetrominoBlock = TetrominoList[Math.floor(Math.random() * range)]
      tetrominoQueueCopy.push(tetrominoBlock);
    }

    setTetrominoQueue(tetrominoQueueCopy);
  };

  const spawnTetromino = () => {

    var nextTetromino = tetrominoQueueRef.current.shift();
    if (!nextTetromino)
      return;

    // Make sure we begin on the right positions
    nextTetromino.positionX = (GameConstants.BlockCountWidth / 2) - 2
    nextTetromino.positionY = 0;
    nextTetromino.rotation = 0;

    // Re-fill the tetromino queue
    fillTetrominoQueue();

    // Check if the new tetromino can be drawed on the board
    if (tryDrawTetromino(nextTetromino, false)) {

      setGameState(GameStateEnumeration.Idle);
      setActiveTetromino(nextTetromino);
    }
    else {
      setGameState(GameStateEnumeration.GameOver);
    }
  };

  const moveTetromino = (
    tetromino: ITetrominoBlock,
    newRotation: number = 0,
    newPosX: number = 0,
    newPosY: number) => {

    // Clamp rotation between 4 * 90° steps
    var rotation = tetromino.rotation + newRotation
    if (rotation > 3)
      rotation = 0;
    if (rotation < 0)
      rotation = 4 + rotation;

    // Check new position on the board
    var posX = tetromino.positionX + newPosX;
    var posY = tetromino.positionY + newPosY;
    if (tryDrawTetromino(tetromino, false, rotation, posX, posY)) {

      tetromino.rotation = rotation;
      tetromino.positionX = posX;
      tetromino.positionY = posY;
      setActiveTetromino({ ...tetromino });

      return true;
    };

    return false;
  };

  const fixTetromino = () => {

    if (activeTetrominoRef.current === null)
      return false;

    if (!tryDrawTetromino(activeTetrominoRef.current, true))
      return false;

    setGameState(GameStateEnumeration.Spawning);

    var filledRowIndices = getFilledRows(gameBoardRef.current);
    filledRowIndices.forEach(rowIndex => {

      if (rowIndex >= gameBoardRef.current.length)
        return;

      gameBoardRef.current.splice(rowIndex, 1);
      gameBoardRef.current.unshift(getGameBoardRow(GameConstants.BlockCountWidth));
    })

    setGameBoard([...gameBoardRef.current]);

    return true;
  };

  const hardDropTetromino = () => {

    if (activeTetrominoRef.current === null)
      return;

    var rowCounter = 0;

    while (moveTetromino(activeTetrominoRef.current, 0, 0, 1))
      rowCounter++;

    if (!fixTetromino())
      setGameState(GameStateEnumeration.Error);
  };

  const tryDrawTetromino = (
    tetromino: ITetrominoBlock,
    fixTetromino: boolean,
    rotation: number = tetromino.rotation,
    posX: number = tetromino.positionX,
    posY: number = tetromino.positionY) => {

    var mergeBlocks: IGameBoardBlock[] = [];

    var tetrominoPositions = tetromino.matrix[rotation];
    for (var y = 0; y < tetrominoPositions.length; y++) {
      for (var x = 0; x < tetrominoPositions[y].length; x++) {

        var isBlockElement = tetrominoPositions[y][x];
        if (!isBlockElement)
          continue;

        var mergePosX = x + posX;
        var mergePosY = y + posY;

        if (mergePosX >= 0 &&
          mergePosX < GameConstants.BlockCountWidth &&
          mergePosY < GameConstants.BlockCountHeight) {

          if (gameBoardRef.current[mergePosY][mergePosX].isFilled)
            return false;
        }
        else {
          return false;
        }

        if (fixTetromino) {

          // Set block props direct
          gameBoardRef.current[mergePosY][mergePosX].style = tetromino.style;
          gameBoardRef.current[mergePosY][mergePosX].isFilled = true;
        }
        else {

          // Save game board blocks for later prcessing
          mergeBlocks.push(gameBoardRef.current[mergePosY][mergePosX])
        }
      }
    }

    if (!fixTetromino) {

      // Clear previously colored blocks that are not filled
      clearGameBoard('NonFilled');

      // Color the game board blocks with the color from the tetromino
      mergeBlocks.forEach(block => {
        block.style = tetromino.style;
      })
    };

    // Dispatch state change on game board
    setGameBoard([...gameBoardRef.current]);

    return true;
  };

  const renderGameBoard = () => {

    return (

      <Box
        component='table'
        sx={{
          borderSpacing: borderSpacing,
          borderLeftWidth: 4,
          borderLeftStyle: 'solid',
          borderLeftColor: (theme) => theme.palette.primary.main,
          borderRightWidth: 4,
          borderRightStyle: 'solid',
          borderRightColor: (theme) => theme.palette.primary.main,
          borderBottomWidth: 4,
          borderBottomStyle: 'solid',
          borderBottomColor: (theme) => theme.palette.primary.main,
        }}>

        <Box
          component='tbody'>

          {gameBoard.map((blockRow, rowIndex) => {

            return (
              <Box
                key={rowIndex}
                component='tr'>

                {blockRow.map((block, blockIndex) => {

                  return (
                    <Box
                      key={blockIndex}
                      component='td'
                      sx={{
                        height: blockSize,
                        width: blockSize,
                        ...block.style
                      }}>


                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderMovementControls = () => {

    return (

      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          justifyItems: 'center'
        }}>

        <Fab
          color='primary'
          onClick={() => {

            if (gameStateRef.current !== GameStateEnumeration.Idle)
              return;

            if (activeTetrominoRef.current === null)
              return;

            moveTetromino(activeTetrominoRef.current, -1, 0, 0);
          }}>

          <ArrowUpwardIcon />
        </Fab>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}>

          <Fab
            color='primary'
            onClick={() => {

              if (gameStateRef.current !== GameStateEnumeration.Idle)
                return;

              if (activeTetrominoRef.current === null)
                return;

              moveTetromino(activeTetrominoRef.current, 0, -1, 0);
            }}>

            <ArrowBackIcon />
          </Fab>

          <Box sx={{ width: (theme) => theme.spacing(4) }} />

          <Fab
            color='primary'
            onClick={() => {

              if (gameStateRef.current !== GameStateEnumeration.Idle)
                return;

              if (activeTetrominoRef.current === null)
                return;

              moveTetromino(activeTetrominoRef.current, 0, 1, 0);
            }}>

            <ArrowForwardIcon />
          </Fab>
        </Box>

        <Fab
          color='primary'
          onClick={() => {

            if (gameStateRef.current !== GameStateEnumeration.Idle)
              return;

            if (activeTetrominoRef.current === null)
              return;

            moveTetromino(activeTetrominoRef.current, 0, 0, 1);
          }}>

          <ArrowDownwardIcon />
        </Fab>
      </Box>
    )
  };

  const renderActionControls = () => {

    return (
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          justifyItems: 'center'
        }}>

        <Fab
          color='secondary'
          onClick={() => {

            if (gameStateRef.current !== GameStateEnumeration.Idle)
              return;

            if (activeTetrominoRef.current === null)
              return;

            moveTetromino(activeTetrominoRef.current, 1, 0, 0);
          }}>

          <Typography
            variant='h4'>
            A
          </Typography>
        </Fab>

        <Box sx={{ width: (theme) => theme.spacing(1) }} />

        <Fab
          color='secondary'
          onClick={() => {

            if (gameStateRef.current !== GameStateEnumeration.Idle)
              return;

            if (activeTetrominoRef.current === null)
              return;

            moveTetromino(activeTetrominoRef.current, -1, 0, 0);
          }}>

          <Typography
            variant='h4'>
            B
          </Typography>
        </Fab>

        <Box sx={{ width: (theme) => theme.spacing(1) }} />

        <Fab
          color='secondary'
          onClick={() => {

            if (gameStateRef.current !== GameStateEnumeration.Idle)
              return;

            setGameState(GameStateEnumeration.HardDrop);
          }}>

          <Typography
            variant='h4'>
            C
          </Typography>
        </Fab>
      </Box>
    );
  };

  const renderGameControls = () => {

    return (

      <Box
        sx={{
          height: controlPanelHeight,
          width: '100%',
          backgroundColor: 'purple',
          display: 'flex',
          flexDirection: 'row',
        }}>

        {renderMovementControls()}
        {renderActionControls()}

      </Box>
    );
  };

  return (

    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        justifyItems: 'center'
      }}>

      {renderGameBoard()}
      {renderGameControls()}

    </Box>

  );
}

export default GameBoard; //React.memo(GameBoard, (prevProps, nextProps) => { return true });
