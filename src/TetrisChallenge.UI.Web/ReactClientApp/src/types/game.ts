import { SxProps, Theme } from '@mui/system';

// Following mostly these Tetris Guidelines
// -> https://harddrop.com/wiki/Tetris_Worlds
// -> https://tetris.fandom.com/wiki/Tetris_Guideline
export class GameConstants {
  public static BlockCountWidth: number = 10;
  public static BlockCountHeight: number = 20;
  public static TetrominoQueueLength: number = 5;
  public static LevelUpLineCount: number = 10;
  public static LineScoreSingle: number = 100;
  public static LineScoreDouble: number = 300;
  public static LineScoreTriple: number = 500;
  public static LineScoreTetris: number = 800;
  public static SoftDropScorePerBlock: number = 1;
  public static HardDropScorePerBlock: number = 2;
};

export interface IBlock {
  //color: string;
  style: SxProps<Theme>;
  positionX: number;
  positionY: number;
};

export interface ITetrominoBlock extends IBlock {
  rotation: number;
  matrix: number[][][];
};

export interface IGameBoardBlock extends IBlock {
  isFilled: boolean;
};

export enum GameStateEnumeration {
  Init,
  Error,
  Idle,
  Paused,
  MoveLeft,
  MoveRight,
  GameOver,
  Spawning,
  HardDrop,
  SoftDrop
};

export interface IGameSession {
  moves: number;
  lines: number;
  level: number;
  score: number;
  hardDrops: number;
};

export interface IMoveData {
  score: number;
  lines: number;
  rotationsCW: number;
  rotationsCCW: number;
  hardDrop: boolean;
  hardDropBlockCount: number;
};

export interface IGameLoopData {
  frameHandle: number;
  lastTimeStamp: DOMHighResTimeStamp;
  passedMillisecondsTick: number;
  speedTick: number;
  state: GameStateEnumeration;
  lastState: GameStateEnumeration;
  activeTetromino?: ITetrominoBlock;
  moveData: IMoveData;
};

export const getGameBoard = (blockCountHeight: number, blockCountWidth: number) => {

  const gameBoard = new Array<Array<IGameBoardBlock>>(blockCountHeight);
  for (let y = 0; y < gameBoard.length; y++) {

    gameBoard[y] = getGameBoardRow(blockCountWidth, y);
  };

  return gameBoard;
};

export const getGameBoardRow = (blockCountWidth: number, rowPosY?: number) => {

  const gameBoardRow = new Array<IGameBoardBlock>(blockCountWidth);
  for (let x = 0; x < gameBoardRow.length; x++) {

    gameBoardRow[x] = {
      isFilled: false,
      style: {
        backgroundColor: 'inherit'
      },
      positionX: x,
      positionY: rowPosY ? rowPosY : 0
    };
  };

  return gameBoardRow;
};

export const getSpeedTick = (level: number) => {
  return 800 - ((level - 1) * 83.3333);
};

export const getMoveData = () => {

  var moveData: IMoveData = {
    score: 0,
    lines: 0,
    rotationsCW: 0,
    rotationsCCW: 0,
    hardDrop: false,
    hardDropBlockCount: 0
  };

  return moveData;
};

export const getGameLoopData = () => {

  var gameLoopData: IGameLoopData = {
    frameHandle: 0,
    lastTimeStamp: 0,
    passedMillisecondsTick: 0,
    speedTick: getSpeedTick(0),
    state: GameStateEnumeration.Init,
    lastState: GameStateEnumeration.Init,
    moveData: getMoveData()
  };

  return gameLoopData;
};

export const getLevel = (lineCount: number) => {
  return Math.floor(lineCount / GameConstants.LevelUpLineCount) + 1;
};

export const getLineScore = (currentLevel: number, currentLineCount: number) => {

  if (currentLineCount <= 0)
    return 0;

  switch (currentLineCount) {
    case 1:
      return currentLevel * GameConstants.LineScoreSingle;
    case 2:
      return currentLevel * GameConstants.LineScoreDouble;
    case 3:
      return currentLevel * GameConstants.LineScoreTriple;
    case 4:
      return currentLevel * GameConstants.LineScoreTetris;
    default:
      return 0;
  }
};

export const getGameSession = () => {

  var session: IGameSession = {
    moves: 0,
    lines: 0,
    level: getLevel(0),
    score: 0,
    hardDrops: 0
  };

  return session;
};

export const getFilledRows = (gameboard: Array<Array<IGameBoardBlock>>) => {

  var isRowFilled = true;
  var filledRows: number[] = [];

  gameboard.forEach((blockRow, rowIndex) => {

    isRowFilled = true;
    blockRow.forEach(block => {

      if (!block.isFilled)
        isRowFilled = false;
    });

    // Add the filled row index to the list
    if (isRowFilled)
      filledRows.push(rowIndex)
  });

  return filledRows;
};
