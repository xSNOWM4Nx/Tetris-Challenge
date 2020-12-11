import React, { useState, useRef, useEffect } from 'react';

class GameConstants {
  public static BOARD_WIDTH: number = 10;
  public static BOARD_HEIGHT: number = 20;
  public static BOARD_BLOCK_SIZE: number = 32;
  public static BASE_TICK: number = 800;
  public static TICK_DECREASE_PER_LEVEL: number = 50;
  public static PLAYTIME_INTERVAL: number = 500;
  public static LEVEL_INCREASE_TIME: number = 30000;
  public static FINISH_WAIT_TIME: number = 1000;
  public static SCORE_FACTOR_PER_LINE: number = 10;
  public static SCORE_FACTOR_PER_HDROP_INTENSITY: number = 2;
}

//#region types

interface BlockPosition {
  x: number;
  y: number;
}

interface Block {
  style: React.CSSProperties;
  position: BlockPosition;
  rotation: number;
  matrix: number[][][];
}

const IBlock: Block = {
  position: {
    x: (GameConstants.BOARD_WIDTH / 2) - 2,
    y: 0
  },
  rotation: 0,
  style: {
    backgroundColor: '#00e5ff'
  },
  matrix: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ]
  ],
}

const JBlock: Block = {
  position: {
    x: (GameConstants.BOARD_WIDTH / 2) - 2,
    y: 0
  },
  rotation: 0,
  style: {
    backgroundColor: '#2979ff'
  },
  matrix: [
    [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    [
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
}

const LBlock: Block = {
  position: {
    x: (GameConstants.BOARD_WIDTH / 2) - 2,
    y: 0
  },
  rotation: 0,
  style: {
    backgroundColor: '#ff9800'
  },
  matrix: [
    [
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ]
  ],
}

const OBlock: Block = {
  position: {
    x: (GameConstants.BOARD_WIDTH / 2) - 2,
    y: 0
  },
  rotation: 0,
  style: {
    backgroundColor: '#ffeb3b'
  },
  matrix: [
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
}

const SBlock: Block = {
  position: {
    x: (GameConstants.BOARD_WIDTH / 2) - 2,
    y: 0
  },
  rotation: 0,
  style: {
    backgroundColor: '#76ff03'
  },
  matrix: [
    [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ]
  ],
}

const TBlock: Block = {
  position: {
    x: (GameConstants.BOARD_WIDTH / 2) - 2,
    y: 0
  },
  rotation: 0,
  style: {
    backgroundColor: '#ab47bc'
  },
  matrix: [
    [
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
}

const ZBlock: Block = {
  position: {
    x: (GameConstants.BOARD_WIDTH / 2) - 2,
    y: 0
  },
  rotation: 0,
  style: {
    backgroundColor: '#f44336'
  },
  matrix: [
    [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
}

const Blocks: Array<Block> = [IBlock, JBlock, LBlock, OBlock, SBlock, TBlock, ZBlock];

interface BoardElement {
  style: React.CSSProperties;
  isFilled: boolean;
}

enum GameState {
  init,
  paused,
  playing,
  gameover
}

enum BoardState {
  init,
  spawn,
  auto,
  softdrop,
  harddrop,
  lock
}

interface GameSession {
  playTime: number;
  speed: number;
  score: number;
  level: number;
  lines: number;
}

interface BlockSession {
  filledLineIndices: number[]
  hardDropIntensity: number;
}

//#endregion
//#region styles

const RootContainerStyle: React.CSSProperties = {
  minHeight: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}

const BarContainerStyle: React.CSSProperties = {
  flex: 'auto',
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  justifyItems: 'center',
}

const CommandButtonStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  margin: 4,
  fontSize: 48,
  border: 'none',
  borderRadius: 8,
  backgroundColor: '#9e9e9e',
}

const PlayButtonStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  margin: 4,
  fontSize: 48,
  border: 'none',
  borderRadius: 8,
  backgroundColor: '#9e9e9e'
}

const BoardContainerStyle: React.CSSProperties = {
  flex: 'auto',
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  alignItems: 'center'
}

const BoardStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  borderSpacing: 0,
  borderCollapse: 'collapse',
  borderLeft: '1px solid #000',
  borderRight: '1px solid #000',
  borderBottom: '1px solid #000',
}

const PreviewBoardStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  borderSpacing: 0,
  borderCollapse: 'collapse',
}

const SessionDataContainerStyle: React.CSSProperties = {
  flex: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignContent: 'start',
  alignItems: 'start',
  justifyContent: 'center',
  justifyItems: 'center',
  color: '#000'
}

const SessionDataStyle: React.CSSProperties = {
  margin: 8
}

const TextLStyle: React.CSSProperties = {
  fontSize: 56,
}

const TextSStyle: React.CSSProperties = {
  fontSize: 24,
}

const GameOverScreenStyle: React.CSSProperties = {
  height: 300,
  width: 400,
  display: 'flex',
  flexDirection: 'column',
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  justifyItems: 'center',
  backgroundColor: 'black',
  color: 'white',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 2,
}

//#endregion
//#region methods

const createEmptyBoard = (height: number, width: number) => {

  const board = new Array<Array<BoardElement>>(height);
  for (let y = 0; y < board.length; y++) {
    board[y] = createEmptyBoardRow(width);
  }

  return board;
}

const createEmptyBoardRow = (width: number) => {

  const boardElement = new Array<BoardElement>(width);
  for (let x = 0; x < boardElement.length; x++) {
    boardElement[x] = {
      style: {},
      isFilled: false
    }
  }

  return boardElement;
}

const getEmptyBlockSession = (): BlockSession => {
  return { filledLineIndices: [], hardDropIntensity: 0 };
}

const getEmptyGameSession = (): GameSession => {
  return { playTime: 0, speed: GameConstants.BASE_TICK, score: 0, level: 1, lines: 0 };
}

//#endregion

interface ILocalProps {
  onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
type Props = ILocalProps;

const BlockGame: React.FC<Props> = (props) => {

  // Fields
  var gameTickID: number = 0;
  var playTimeID: number = 0;
  var finishTickID: number = 0;
  var blockQueueLength: number = 5;

  // States
  const [gameState, setGameState] = useState<GameState>(GameState.init);
  const [board, setBoard] = useState<BoardElement[][]>([[]])
  const [boardState, setBoardState] = useState<BoardState>(BoardState.init);
  const [blockQueue, setBlockQueue] = useState<Array<Block>>([]);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [blockSession, setBlockSession] = useState<BlockSession>(getEmptyBlockSession());
  const [gameSession, setGameSession] = useState<GameSession>(getEmptyGameSession());

  // Refs
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

  const boardRef = useRef(board)
  boardRef.current = board

  const boardStateRef = useRef(boardState)
  boardStateRef.current = boardState

  const activeBlockRef = useRef(activeBlock)
  activeBlockRef.current = activeBlock

  const gameSessionRef = useRef(gameSession)
  gameSessionRef.current = gameSession

  const blockSessionRef = useRef(blockSession)
  blockSessionRef.current = blockSession

  // Effects
  useEffect(() => {

    // Mount
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);

    fillQueue();
    fillBoard();

    // Unmount
    return () => {

      document.removeEventListener("keydown", handleKeyDown, false);
      document.removeEventListener("keyup", handleKeyUp, false);

      // Clear handles
      clearTimeout(gameTickID);
      clearInterval(playTimeID);
    }
  }, []);
  useEffect(() => {

    switch (boardState) {
      case BoardState.spawn: {

        spawnBlock();
        break;
      }
      case BoardState.harddrop: {

        if (activeBlock === null) {
          return;
        }

        hardDropBlock(activeBlock);
        break;
      }
      case BoardState.lock: {

        if (activeBlock === null) {
          return;
        }

        lockBlock(activeBlock);
        break;
      }
    }

  }, [boardState]);

  const play = () => {

    setGameState(GameState.playing);

    gameTickID = window.setTimeout(onGameTick, gameSession.speed);
    playTimeID = window.setInterval(onPlayTime, GameConstants.PLAYTIME_INTERVAL);
  }

  const pause = () => {
    setGameState(GameState.paused);
  }

  const onGameTick = () => {

    if (gameStateRef.current === GameState.init ||
      gameStateRef.current === GameState.paused ||
      gameStateRef.current === GameState.gameover) {

      // Clear handles
      clearTimeout(gameTickID);
      return;
    }

    // Check for a active block, else change the state to spawn
    if (activeBlockRef.current === null) {
      setBoardState(BoardState.spawn);
    }

    if (activeBlockRef.current !== null &&
      boardStateRef.current === BoardState.auto) {

      if (!moveBlock(activeBlockRef.current, 0, 0, 1)) {
        setBoardState(BoardState.lock);
      }
    }

    // Reset game tick
    gameTickID = window.setTimeout(onGameTick, gameSessionRef.current.speed);
  }

  const onPlayTime = () => {

    if (gameStateRef.current === GameState.init ||
      gameStateRef.current === GameState.paused ||
      gameStateRef.current === GameState.gameover) {

      // Clear handles
      clearInterval(playTimeID);
      return;
    }

    var newPlayTime = gameSessionRef.current.playTime + GameConstants.PLAYTIME_INTERVAL;
    var newLevel = Math.floor(newPlayTime / GameConstants.LEVEL_INCREASE_TIME) + 1;
    var newSpeed = GameConstants.BASE_TICK - (newLevel * GameConstants.TICK_DECREASE_PER_LEVEL) + GameConstants.TICK_DECREASE_PER_LEVEL;

    setGameSession({
      ...gameSessionRef.current,
      playTime: newPlayTime,
      speed: newSpeed,
      level: newLevel
    });
  }

  const onFinish = () => {

    clearTimeout(finishTickID);

    clearBoard('FilledLines');
    updateSessionData();
    setActiveBlock(null);
  }

  const fillQueue = (replaceAll?: boolean) => {

    var blockQueueCopy = [...blockQueue];
    if (replaceAll === true)
      blockQueueCopy = [];

    while (blockQueueCopy.length < blockQueueLength) {

      var range = Blocks.length;
      var b = Blocks[Math.floor(Math.random() * range)]
      blockQueueCopy.push(b);
    }

    setBlockQueue(blockQueueCopy);
  }

  const fillBoard = () => {
    setBoard(createEmptyBoard(GameConstants.BOARD_HEIGHT, GameConstants.BOARD_WIDTH));
  }

  const clearBoard = (clearType: 'All' | 'NonFilled' | 'FilledLines') => {

    var filledLineIndices = blockSessionRef.current.filledLineIndices;
    if (clearType === 'FilledLines') {

      filledLineIndices.forEach(rowIndex => {

        if (rowIndex >= boardRef.current.length)
          return;

        boardRef.current.splice(rowIndex, 1);
        boardRef.current.unshift(createEmptyBoardRow(GameConstants.BOARD_WIDTH));
      })

      return;
    }

    boardRef.current.forEach((boardRow, rowIndex) => {
      boardRow.forEach(boardElement => {

        switch (clearType) {
          case 'All': {

            boardElement.isFilled = false;
            boardElement.style = {};
            break;
          }
          case 'NonFilled': {

            if (!boardElement.isFilled)
              boardElement.style = {};
            break;
          }
        }
      })
    })

    setBoard([...boardRef.current]);
  }

  const checkBoard = () => {

    var isRowFilled = true;
    var filledLineIndices: number[] = [];

    boardRef.current.forEach((boardRow, rowIndex) => {

      isRowFilled = true;

      boardRow.forEach(boardElement => {

        if (!boardElement.isFilled)
          isRowFilled = false;
      })

      // Add the filled row index to the list
      if (isRowFilled) {
        filledLineIndices.push(rowIndex)
      }
    })

    // Reduce the Opacity of filled lines
    filledLineIndices.forEach(rowIndex => {

      if (rowIndex >= boardRef.current.length)
        return;

      boardRef.current[rowIndex].forEach(boardElement => {
        boardElement.style = { ...boardElement.style, opacity: 0.5 }
      })
    })

    setBlockSession({
      ...blockSessionRef.current,
      filledLineIndices: filledLineIndices
    });
  }

  const spawnBlock = () => {

    var nextBlock = blockQueue.shift();
    if (!nextBlock)
      return;

    // Make sure we begin on the right positions
    nextBlock.position.x = (GameConstants.BOARD_WIDTH / 2) - 2
    nextBlock.position.y = 0;
    nextBlock.rotation = 0;

    // Re-fill the block queue
    fillQueue();

    // Check if the new block can be spawned on the board
    if (mergeBlock(nextBlock)) {

      setBoardState(BoardState.auto);
      setActiveBlock(nextBlock);
    }
    else {
      setBoardState(BoardState.lock);
      setGameState(GameState.gameover);
    }
  }

  const moveBlock = (b: Block, newRotation: number = 0, newPosX: number = 0, newPosY: number) => {

    // Clamp rotation between 4 * 90° steps
    var rotation = b.rotation + newRotation
    if (rotation > 3)
      rotation = 0;
    if (rotation < -3)
      rotation = 0;

    // Check new position on the board
    var posX = b.position.x + newPosX;
    var posY = b.position.y + newPosY;
    if (mergeBlock(b, rotation, posX, posY)) {

      b.rotation = rotation;
      b.position.x = posX;
      b.position.y = posY;
      setActiveBlock(b);

      return true;
    }

    return false;
  }

  const lockBlock = (b: Block) => {

    var blockMatrix = b.matrix[b.rotation];

    for (var y = 0; y < blockMatrix.length; y++) {
      for (var x = 0; x < blockMatrix[y].length; x++) {

        var isBlockElement = blockMatrix[y][x];
        if (!isBlockElement)
          continue;

        var lockPosX = x + b.position.x;
        var lockPosY = y + b.position.y;

        if (lockPosX >= 0 &&
          lockPosX < GameConstants.BOARD_WIDTH &&
          lockPosY < GameConstants.BOARD_HEIGHT) {

          boardRef.current[lockPosY][lockPosX].isFilled = true;
          boardRef.current[lockPosY][lockPosX].style = b.style;
        }
      }
    }

    checkBoard();
    setBoard([...boardRef.current]);

    finishTickID = window.setTimeout(onFinish, GameConstants.FINISH_WAIT_TIME);
  }

  const mergeBlock = (b: Block, rotation: number = b.rotation, posX: number = b.position.x, posY: number = b.position.y) => {

    var blockMatrix = b.matrix[rotation];
    var mergePositions: BlockPosition[] = [];

    for (var y = 0; y < blockMatrix.length; y++) {
      for (var x = 0; x < blockMatrix[y].length; x++) {

        var isBlockElement = blockMatrix[y][x];
        if (!isBlockElement)
          continue;

        var mergePosX = x + posX;
        var mergePosY = y + posY;

        if (mergePosX >= 0 &&
          mergePosX < GameConstants.BOARD_WIDTH &&
          mergePosY < GameConstants.BOARD_HEIGHT) {

          if (boardRef.current[mergePosY][mergePosX].isFilled)
            return false;
        }
        else {
          return false;
        }

        mergePositions.push({ y: mergePosY, x: mergePosX });
      }
    }

    clearBoard('NonFilled');

    mergePositions.forEach(pos => {
      boardRef.current[pos.y][pos.x].style = b.style;
    })

    setBoard([...boardRef.current]);

    return true;
  }

  const hardDropBlock = (b: Block) => {

    var rowCounter = 0;
    while (moveBlock(b, 0, 0, 1)) {
      rowCounter++;
    }

    setBlockSession({
      ...blockSessionRef.current,
      hardDropIntensity: rowCounter
    });
    setBoardState(BoardState.lock);
  }

  const updateSessionData = () => {

    var filledLines = blockSessionRef.current.filledLineIndices.length;

    if (filledLines > 0) {

      // Calculate new line count
      var newLineCount = gameSessionRef.current.lines + filledLines;

      // Calculate the score for the filled lines
      var lineScore = (filledLines * (filledLines * GameConstants.SCORE_FACTOR_PER_LINE)) * gameSessionRef.current.level;

      // Calculate the score if a hard drop was used
      var hardDropScore = (blockSessionRef.current.hardDropIntensity * GameConstants.SCORE_FACTOR_PER_HDROP_INTENSITY) * gameSessionRef.current.level;

      setGameSession({
        ...gameSessionRef.current,
        lines: newLineCount,
        score: gameSession.score + lineScore + hardDropScore
      });
    }

    setBlockSession(getEmptyBlockSession());
  }

  const handlePlayClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    if (gameState === GameState.init)
      play();

    if (gameState === GameState.paused)
      play();

    if (gameState === GameState.playing)
      pause();
  }

  const handleRestartClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    setGameState(GameState.init);
    setGameSession(getEmptyGameSession());
    setBlockSession(getEmptyBlockSession());

    fillQueue(true);
    clearBoard('All');
  }

  const handleKeyDown = (e: KeyboardEvent) => {

    if (gameStateRef.current !== GameState.playing)
      return;

    if (activeBlockRef.current === null)
      return;

    if (e.key === 'ArrowLeft' ||
      e.key === 'a')
      moveBlock(activeBlockRef.current, 0, -1, 0);

    if (e.key === 'ArrowRight' ||
      e.key === 'd')
      moveBlock(activeBlockRef.current, 0, 1, 0);

    if (e.key === 'ArrowDown' ||
      e.key === 's') {

      if (boardStateRef.current === BoardState.auto)
        setBoardState(BoardState.softdrop);

      if (boardStateRef.current === BoardState.softdrop) {
        if (!moveBlock(activeBlockRef.current, 0, 0, 1)) {
          setBoardState(BoardState.lock);
        }
      }
    }

    if (e.key === 'ArrowUp' ||
      e.key === 'w')
      moveBlock(activeBlockRef.current, 1, 0, 0);

    if (e.key === 'Control') {
      if (boardStateRef.current === BoardState.auto)
        setBoardState(BoardState.harddrop);
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {

    if (e.key === 'ArrowDown' ||
      e.key === 's') {

      if (boardStateRef.current === BoardState.softdrop) {
        setBoardState(BoardState.auto);
      }
    }
  }

  const handlePlayLeftClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    if (gameStateRef.current !== GameState.playing)
      return;

    if (activeBlockRef.current === null)
      return;

    moveBlock(activeBlockRef.current, 0, -1, 0);
  }

  const handlePlayRotateClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    if (gameStateRef.current !== GameState.playing)
      return;

    if (activeBlockRef.current === null)
      return;

    moveBlock(activeBlockRef.current, 1, 0, 0);
  }

  const handlePlaySoftDropClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    if (gameStateRef.current !== GameState.playing)
      return;

    if (activeBlock === null)
      return;

    if (!moveBlock(activeBlock, 0, 0, 1)) {
      setBoardState(BoardState.lock);
    }
  }

  const handlePlayHardDropClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    if (gameStateRef.current !== GameState.playing)
      return;

    if (boardStateRef.current === BoardState.auto)
      setBoardState(BoardState.harddrop);
  }

  const handlePlayRightClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    if (gameStateRef.current !== GameState.playing)
      return;

    if (activeBlockRef.current === null)
      return;

    moveBlock(activeBlockRef.current, 0, 1, 0);
  }

  const renderCommandBar = () => {

    return (
      <React.Fragment>
        <button
          style={CommandButtonStyle}
          onClick={props.onClose}>
          {'↩️'}
        </button>
        <button
          style={CommandButtonStyle}
          onClick={handlePlayClick}>
          {(gameState === GameState.playing) ? '⏸' : '▶️'}
        </button>
        <button
          style={CommandButtonStyle}
          onClick={handleRestartClick}>
          {'🔄'}
        </button>
      </React.Fragment>
    )
  }

  const renderBoard = () => {

    return (

      <table
        style={BoardStyle}>

        <tbody>
          {board.map((boardRow, rowIndex) => {

            return (
              <tr
                key={rowIndex}>

                {boardRow.map((boardElement, elementIndex) => {

                  return (
                    <td
                      key={elementIndex}
                      style={{
                        width: GameConstants.BOARD_BLOCK_SIZE,
                        height: GameConstants.BOARD_BLOCK_SIZE,
                        ...boardElement.style
                      }} />
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  const renderGameOverScreen = () => {

    if (gameState !== GameState.gameover)
      return;

    return (
      <div style={GameOverScreenStyle}>
        <div style={TextLStyle}>
          {'GAME OVER'}
        </div>
      </div>
    )
  }

  const renderPreview = () => {

    var previewBlock = blockQueue[0];
    var previewBoard = createEmptyBoard(4, 4);

    return (

      <table
        style={PreviewBoardStyle}>

        <tbody>
          {previewBoard.map((boardRow, rowIndex) => {

            return (
              <tr
                key={rowIndex}>

                {boardRow.map((boardElement, elementIndex) => {

                  var previewBlockStyle: React.CSSProperties = {}
                  if (previewBlock) {
                    if (previewBlock.matrix[0][rowIndex][elementIndex] > 0)
                      previewBlockStyle = previewBlock.style;
                  }

                  return (
                    <td
                      key={elementIndex}
                      style={{
                        width: GameConstants.BOARD_BLOCK_SIZE,
                        height: GameConstants.BOARD_BLOCK_SIZE,
                        ...previewBlockStyle
                      }} />
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  const renderSessionData = () => {

    var playTimeDate = new Date(gameSession.playTime);

    return (
      <div style={SessionDataContainerStyle}>

        <div style={SessionDataStyle}>
          <div style={TextSStyle}>
            {'PREVIEW'}
          </div>
          <div style={TextLStyle}>
            {renderPreview()}
          </div>
        </div>

        <div style={SessionDataStyle}>
          <div style={TextSStyle}>
            {'TIME'}
          </div>
          <div style={TextLStyle}>
            {`${('0' + playTimeDate.getMinutes().toString()).slice(-2)}:${('0' + playTimeDate.getSeconds().toString()).slice(-2)}`}
          </div>
        </div>

        <div style={SessionDataStyle}>
          <div style={TextSStyle}>
            {'SCORE'}
          </div>
          <div style={TextLStyle}>
            {`${gameSession.score}`}
          </div>
        </div>

        <div style={SessionDataStyle}>
          <div style={TextSStyle}>
            {'LEVEL'}
          </div>
          <div style={TextLStyle}>
            {`${gameSession.level}`}
          </div>
        </div>

        <div style={SessionDataStyle}>
          <div style={TextSStyle}>
            {'LINES'}
          </div>
          <div style={TextLStyle}>
            {`${gameSession.lines}`}
          </div>
        </div>

      </div>
    )
  }

  const renderPlayBar = () => {

    return (
      <React.Fragment>
        <button
          style={PlayButtonStyle}
          onClick={handlePlayLeftClick}>
          {'⏪'}
        </button>
        <button
          style={PlayButtonStyle}
          onClick={handlePlayRotateClick}>
          {'✨'}
        </button>
        <button
          style={PlayButtonStyle}
          onClick={handlePlaySoftDropClick}>
          {'⏬'}
        </button>
        <button
          style={PlayButtonStyle}
          onClick={handlePlayHardDropClick}>
          {'⚡'}
        </button>
        <button
          style={PlayButtonStyle}
          onClick={handlePlayRightClick}>
          {'⏩'}
        </button>

      </React.Fragment>
    )
  }

  return (

    <div style={RootContainerStyle}>

      <div style={BarContainerStyle}>
        {renderCommandBar()}
      </div>

      <div style={BoardContainerStyle}>
        <div style={{ flex: '1 1 0' }}>

        </div>
        <div style={{}}>
          {renderBoard()}
          {renderGameOverScreen()}
        </div>
        <div style={{ flex: '1 1 0' }}>
          {renderSessionData()}
        </div>
      </div>

      <div style={BarContainerStyle}>
        {renderPlayBar()}
      </div>

    </div>
  );
}

export default BlockGame;
