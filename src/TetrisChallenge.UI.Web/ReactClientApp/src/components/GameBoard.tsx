import React, { useState, useContext, useRef, useEffect } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { AutoSizeContainer } from '@daniel.neuweiler/react-lib-module';

import {
  IGameLoopData, getGameLoopData, IGameBoardBlock, getGameBoard, getGameBoardRow, getGameSession,
  GameConstants, IGameSession, GameStateEnumeration,
  ITetrominoBlock, TetrominoList, getFilledRows, getLevel, getMoveData, getSpeedTick, getLineScore
} from './../types';

import TetrominoRenderer from './TetrominoRenderer';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface ILocalProps {
  // height: number;
  // width: number;
  showControlPanel?: boolean;
  borderSpacing?: number;
  backgroundColor?: string;
}
type Props = ILocalProps;

const GameBoard: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'GameBoard';
  const borderSpacing = (props.borderSpacing !== undefined) ? props.borderSpacing : 0
  const statePanelHeight = 64;
  const controlPanelHeight = 192;

  // States
  const [blockSize, setBlockSize] = useState(0);
  const [gameBoard, setGameBoard] = useState<Array<Array<IGameBoardBlock>>>(getGameBoard(GameConstants.BlockCountHeight, GameConstants.BlockCountWidth));
  const [gameSession, setGameSession] = useState<IGameSession>(getGameSession());
  const [tetrominoQueue, setTetrominoQueue] = useState<Array<ITetrominoBlock>>([]);

  // Refs
  const gameLoopDataRef = useRef<IGameLoopData>(getGameLoopData());

  const blockSizeRef = useRef(blockSize);
  blockSizeRef.current = blockSize;

  const gameBoardRef = useRef(gameBoard);
  gameBoardRef.current = gameBoard;

  const gameSessionRef = useRef(gameSession);
  gameSessionRef.current = gameSession;

  const tetrominoQueueRef = useRef(tetrominoQueue);
  tetrominoQueueRef.current = tetrominoQueue;

  // Effects
  useEffect(() => {

    // Mount
    // document.addEventListener("keydown", handleKeyDown, false);
    // document.addEventListener("keyup", handleKeyUp, false);

    fillTetrominoQueue();
    gameLoopDataRef.current.frameHandle = window.requestAnimationFrame(gameLoop);
    gameLoopDataRef.current.state = GameStateEnumeration.Paused;

    // Unmount
    return () => {

      // document.removeEventListener("keydown", handleKeyDown, false);
      // document.removeEventListener("keyup", handleKeyUp, false);

      // Clear handles
      window.cancelAnimationFrame(gameLoopDataRef.current.frameHandle);
    }
  }, []);
  // useEffect(() => {

  //   var boardElementsHeight = statePanelHeight;
  //   if (props.showControlPanel)
  //     boardElementsHeight += controlPanelHeight;

  //   var blockHeightSize =
  //     Math.floor((props.height - boardElementsHeight) / GameConstants.BlockCountHeight) -
  //     (borderSpacing * 2);

  //   var blockWidthSize =
  //     Math.floor((boardWidthPercentage * props.width / 100) / GameConstants.BlockCountWidth) -
  //     (borderSpacing * 2);

  //   console.log('--------------->>')
  //   console.log(blockHeightSize)

  //   var newBlockSize = blockHeightSize;
  //   if (newBlockSize > blockWidthSize)
  //     newBlockSize = blockWidthSize;

  //   setBlockSize(newBlockSize);

  // }, [props.width, props.height, props.showControlPanel]);

  const gameLoop = (timeStamp: DOMHighResTimeStamp) => {

    // Prepare time data
    var passedMilliseconds = (timeStamp - gameLoopDataRef.current.lastTimeStamp);
    var passedSeconds = passedMilliseconds / 1000;
    gameLoopDataRef.current.lastTimeStamp = timeStamp;
    gameLoopDataRef.current.passedMillisecondsTick += passedMilliseconds;

    // Calculate fps
    var fps = Math.round(1 / passedSeconds);

    updateSessionData();
    updateGameState();

    // Keep requesting new frames
    gameLoopDataRef.current.frameHandle = window.requestAnimationFrame(gameLoop);
  };

  const updateGameState = () => {

    if (gameLoopDataRef.current.state === GameStateEnumeration.Paused)
      return;

    if (gameLoopDataRef.current.state === GameStateEnumeration.Init) {

      gameLoopDataRef.current.activeTetromino = undefined;
      gameLoopDataRef.current.passedMillisecondsTick = 0;

      setGameState(GameStateEnumeration.Spawning);
      return;
    }

    if (gameLoopDataRef.current.state === GameStateEnumeration.Spawning) {

      gameLoopDataRef.current.activeTetromino = undefined;
      gameLoopDataRef.current.passedMillisecondsTick = 0;

      if (spawnTetromino()) {
        setGameState(GameStateEnumeration.Idle);
      }
      else {
        setGameState(GameStateEnumeration.GameOver);
      }

      return;
    };

    if (gameLoopDataRef.current.activeTetromino === undefined) {

      setGameState(GameStateEnumeration.Error);
      return;
    };

    if (gameLoopDataRef.current.state === GameStateEnumeration.HardDrop) {

      gameLoopDataRef.current.passedMillisecondsTick = 0;
      return;
    };

    if (gameLoopDataRef.current.state === GameStateEnumeration.SoftDrop) {

      gameLoopDataRef.current.passedMillisecondsTick = 0;
      moveTetromino(gameLoopDataRef.current.activeTetromino, 0, 0, 1);
    };

    if (gameLoopDataRef.current.state === GameStateEnumeration.MoveLeft) {

      moveTetromino(gameLoopDataRef.current.activeTetromino, 0, -1, 0);
    };

    if (gameLoopDataRef.current.state === GameStateEnumeration.MoveRight) {

      moveTetromino(gameLoopDataRef.current.activeTetromino, 0, 1, 0);
    };

    if ((gameLoopDataRef.current.state === GameStateEnumeration.Idle ||
      gameLoopDataRef.current.state === GameStateEnumeration.MoveLeft ||
      gameLoopDataRef.current.state === GameStateEnumeration.MoveRight) &&
      gameLoopDataRef.current.passedMillisecondsTick >= gameLoopDataRef.current.speedTick) {

      gameLoopDataRef.current.passedMillisecondsTick = 0;

      if (!moveTetromino(gameLoopDataRef.current.activeTetromino, 0, 0, 1)) {

        if (fixTetromino()) {
          setGameState(GameStateEnumeration.Spawning);
        }
        else {
          setGameState(GameStateEnumeration.Error);
        };
      };
    };
  };

  const updateSessionData = () => {

    if (gameLoopDataRef.current.state === GameStateEnumeration.Spawning) {

      var newGameSession = { ...gameSessionRef.current }
      newGameSession.moves++;
      newGameSession.lines += gameLoopDataRef.current.moveData.lines;
      newGameSession.score += gameLoopDataRef.current.moveData.score;

      if (gameLoopDataRef.current.moveData.hardDrop)
        newGameSession.hardDrops++;

      newGameSession.level = getLevel(newGameSession.lines);

      gameLoopDataRef.current.speedTick = getSpeedTick(newGameSession.level);
      gameLoopDataRef.current.moveData = getMoveData();

      setGameSession(newGameSession);
    }
  };

  const setGameState = (newState: GameStateEnumeration) => {

    gameLoopDataRef.current.lastState = gameLoopDataRef.current.state;
    gameLoopDataRef.current.state = newState;
  };

  const play = () => {

    const newState: GameStateEnumeration = (gameLoopDataRef.current.activeTetromino !== undefined) ? GameStateEnumeration.Idle : GameStateEnumeration.Spawning;
    setGameState(newState);
  };

  const pause = () => {
    setGameState(GameStateEnumeration.Paused);
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
      return false;

    // Make sure we begin on the right positions
    nextTetromino.positionX = (GameConstants.BlockCountWidth / 2) - 2
    nextTetromino.positionY = 0;
    nextTetromino.rotation = 0;

    var drawResult = drawTetromino(nextTetromino, false);
    if (drawResult) {

      gameLoopDataRef.current.activeTetromino = nextTetromino;

      // Re-fill the tetromino queue
      fillTetrominoQueue();
    }

    return drawResult;
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
    if (drawTetromino(tetromino, false, rotation, posX, posY)) {

      tetromino.rotation = rotation;
      tetromino.positionX = posX;
      tetromino.positionY = posY;

      return true;
    };

    return false;
  };

  const fixTetromino = () => {

    if (gameLoopDataRef.current.activeTetromino === undefined)
      return false;

    if (!drawTetromino(gameLoopDataRef.current.activeTetromino, true))
      return false;

    // Get filled rows
    var filledRowIndices = getFilledRows(gameBoardRef.current);

    // Clear filled rows
    filledRowIndices.forEach(rowIndex => {

      if (rowIndex >= gameBoardRef.current.length)
        return;

      gameBoardRef.current.splice(rowIndex, 1);
      gameBoardRef.current.unshift(getGameBoardRow(GameConstants.BlockCountWidth));
    })

    // Update score
    gameLoopDataRef.current.moveData.lines = filledRowIndices.length;
    gameLoopDataRef.current.moveData.score += getLineScore(gameSessionRef.current.level, filledRowIndices.length);

    // setMoveCount(moveCountRef.current + 1);
    setGameBoard([...gameBoardRef.current]);

    return true;
  };

  const hardDropTetromino = () => {

    if (gameLoopDataRef.current.activeTetromino === undefined)
      return;

    gameLoopDataRef.current.moveData.hardDrop = true;
    while (moveTetromino(gameLoopDataRef.current.activeTetromino, 0, 0, 1))
      gameLoopDataRef.current.moveData.hardDropBlockCount++;

    // Update score
    gameLoopDataRef.current.moveData.score += gameLoopDataRef.current.moveData.hardDropBlockCount * GameConstants.HardDropScorePerBlock;

    if (fixTetromino()) {

      setGameState(GameStateEnumeration.Spawning);
    }
    else {
      setGameState(GameStateEnumeration.Error);
    };
  };

  const drawTetromino = (
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

  const renderStats = (width: number) => {

    return (

      <Box
        sx={{
          width: width,
          marginRight: 1,
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'flex-end',
          alignItems: 'flex-end'
        }}>

        {/* <Fab
              color='secondary'
              onClick={() => {

                if (gameLoopDataRef.current.state !== GameStateEnumeration.Idle)
                  return;

                if (gameLoopDataRef.current.activeTetromino === undefined)
                  return;

                moveTetromino(gameLoopDataRef.current.activeTetromino, 1, 0, 0);
              }}>

              <Typography
                variant='h4'>
                A
              </Typography>
            </Fab> */}

        <Typography
          variant='h6'>
          {'Lines'}
        </Typography>
        <Typography
          variant='h3'>
          {gameSessionRef.current.lines}
        </Typography>

        <Box sx={{ width: (theme) => theme.spacing(4) }} />

        <Typography
          variant='h6'>
          {'Level'}
        </Typography>
        <Typography
          variant='h3'>
          {gameSessionRef.current.level}
        </Typography>

        <Box sx={{ width: (theme) => theme.spacing(4) }} />

        <Typography
          variant='h6'>
          {'Score'}
        </Typography>
        <Typography
          variant='h3'>
          {gameSessionRef.current.score}
        </Typography>
      </Box>
    );
  };

  const renderStatePanel = () => {

    return (

      <Box
        sx={{
          backgroundColor: 'blue',
          height: statePanelHeight,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          justifyItems: 'center',
        }}>



      </Box>
    );
  };

  const renderGameBoard = () => {

    return (

      <Box
        component='table'
        sx={{
          borderSpacing: borderSpacing,
          backgroundColor: props.backgroundColor,
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
                        ...block.style,
                        backgroundColor: 'green'
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

  const renderPreview = (width: number) => {

    return (

      <Box
        sx={{
          width: width,
          marginLeft: 1,
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'flex-start',
          alignItems: 'flex-start'
        }}>

        <TetrominoRenderer
          tetromino={tetrominoQueue[0]}
          blockSize={blockSize} />

        <Box sx={{ width: (theme) => theme.spacing(1) }} />

        <TetrominoRenderer
          tetromino={tetrominoQueue[1]}
          blockSize={blockSize} />

        <Box sx={{ width: (theme) => theme.spacing(1) }} />

        <TetrominoRenderer
          tetromino={tetrominoQueue[2]}
          blockSize={blockSize} />
      </Box>
    );
  };

  const renderMovementControls = () => {

    return (

      <Box
        sx={{
          // width: '50%',
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

            if (gameLoopDataRef.current.state !== GameStateEnumeration.Idle)
              return;

            if (gameLoopDataRef.current.activeTetromino === undefined)
              return;

            moveTetromino(gameLoopDataRef.current.activeTetromino, -1, 0, 0);
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
            onMouseDown={() => {

              if (gameLoopDataRef.current.state === GameStateEnumeration.Idle)
                setGameState(GameStateEnumeration.MoveLeft);
            }}
            onMouseUp={() => {

              if (gameLoopDataRef.current.state === GameStateEnumeration.MoveLeft)
                setGameState(GameStateEnumeration.Idle);
            }}>

            <ArrowBackIcon />
          </Fab>

          <Box sx={{ width: (theme) => theme.spacing(4) }} />

          <Fab
            color='primary'
            onMouseDown={() => {

              if (gameLoopDataRef.current.state === GameStateEnumeration.Idle)
                setGameState(GameStateEnumeration.MoveRight);
            }}
            onMouseUp={() => {

              if (gameLoopDataRef.current.state === GameStateEnumeration.MoveRight)
                setGameState(GameStateEnumeration.Idle);
            }}>

            <ArrowForwardIcon />
          </Fab>
        </Box>

        <Fab
          color='primary'
          onMouseDown={() => {

            if (gameLoopDataRef.current.state === GameStateEnumeration.Idle)
              setGameState(GameStateEnumeration.SoftDrop);
          }}
          onMouseUp={() => {

            if (gameLoopDataRef.current.state === GameStateEnumeration.SoftDrop)
              setGameState(GameStateEnumeration.Idle);
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

            if (gameLoopDataRef.current.state !== GameStateEnumeration.Idle)
              return;

            if (gameLoopDataRef.current.activeTetromino === undefined)
              return;

            moveTetromino(gameLoopDataRef.current.activeTetromino, 1, 0, 0);
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

            if (gameLoopDataRef.current.state !== GameStateEnumeration.Idle)
              return;

            if (gameLoopDataRef.current.activeTetromino === undefined)
              return;

            moveTetromino(gameLoopDataRef.current.activeTetromino, -1, 0, 0);
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

            if (gameLoopDataRef.current.state === GameStateEnumeration.Idle) {

              setGameState(GameStateEnumeration.HardDrop);
              hardDropTetromino();
            }

          }}>

          <Typography
            variant='h4'>
            C
          </Typography>
        </Fab>
      </Box>
    );
  };

  const renderGameContent = (height: number, width: number) => {

    var gameBoardWidth = 0.5 * width;
    var statsWidth = 0.25 * width;
    var previewWidth = 0.25 * width;

    var blockHeightSize =
      Math.floor(height / GameConstants.BlockCountHeight) -
      (borderSpacing * 2);

    var blockWidthSize =
      Math.floor(gameBoardWidth / GameConstants.BlockCountWidth) -
      (borderSpacing * 2);

    var newBlockSize = blockHeightSize;
    if (newBlockSize > blockWidthSize)
      newBlockSize = blockWidthSize;

    if (blockSizeRef.current !== newBlockSize)
      setBlockSize(newBlockSize);

    return (

      <Box
        sx={{
          flex: 'auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          justifyItems: 'center',
        }}>

        {renderStats(statsWidth)}
        {renderGameBoard()}
        {renderPreview(previewWidth)}
      </Box>
    );
  };

  const renderControlPanel = () => {

    if (!props.showControlPanel)
      return undefined;

    return (

      <Box
        sx={{
          minHeight: controlPanelHeight,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          justifyItems: 'center'
        }}>

        {renderMovementControls()}

        <Box sx={{ width: (theming) => theming.spacing(4) }} />

        {renderActionControls()}

      </Box>
    );
  };

  return (

    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>

      {renderStatePanel()}

      <Box
        sx={{
          flex: 'auto'
        }}>

        <AutoSizeContainer
          showContentOnResize={true}
          onRenderSizedChild={renderGameContent} />
      </Box>

      {renderControlPanel()}
    </Box>

  );
}

export default GameBoard; //React.memo(GameBoard, (prevProps, nextProps) => { return true });
