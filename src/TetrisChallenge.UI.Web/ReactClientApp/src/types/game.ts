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
};

export interface IBlock {
  //color: string;
  style: SxProps<Theme>;
  positionX: number;
  positionY: number;
};

export interface IGameBoardBlock extends IBlock {
  isFilled: boolean;
};

export enum GameStateEnumeration {
  Init,
  Error,
  Idle,
  Paused,
  GameOver,
  Spawning,
  HardDrop
};

export interface IGameSession {
  lines: number;
  level: number;
  score: number;
  speedTick: number;
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

  var gameSession: IGameSession = {
    lines: 0,
    level: getLevel(0),
    score: 0,
    speedTick: getSpeedTick(0)
  };

  return gameSession;
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
