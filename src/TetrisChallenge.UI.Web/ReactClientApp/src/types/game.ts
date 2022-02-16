import { SxProps, Theme } from '@mui/system';

// Following mostly these Tetris Guidelines
// -> https://harddrop.com/wiki/Tetris_Worlds
// -> https://tetris.fandom.com/wiki/Tetris_Guideline
export class GameConstants {
  public static BlockCountWidth: number = 10;
  public static BlockCountHeight: number = 20;
  public static TetrominoQueueLength: number = 3;
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
  level: number;
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
  return 800 - (level * 83.3333);
};

export const getGameSession = () => {

  var gameSession: IGameSession = {
    level: 0,
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
