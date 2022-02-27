import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { ITetrominoBlock, IGameBoardBlock, getGameBoard } from './../types';

interface ILocalProps {
  height: number;
  width: number;
  tetromino: ITetrominoBlock;
  maxBlockSize?: number;
  borderSpacing?: number;
  backgroundColor?: string;
}
type Props = ILocalProps;

const TetrominoRenderer: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'TetrominoRenderer';
  const borderSpacing = (props.borderSpacing !== undefined) ? props.borderSpacing : 0;
  const previewBoardBlockCount: number = 4;

  // States
  const [blockSize, setBlockSize] = useState(0);
  const [previewBoard, setPreviewBoard] = useState<Array<Array<IGameBoardBlock>>>(getGameBoard(previewBoardBlockCount, previewBoardBlockCount));

  // Effects
  useEffect(() => {

    var blockHeightSize =
      Math.floor(props.height / previewBoardBlockCount) -
      (borderSpacing * 2);

    var blockWidthSize =
      Math.floor(props.width / previewBoardBlockCount) -
      (borderSpacing * 2);

    var newBlockSize = blockHeightSize;
    if (newBlockSize > blockWidthSize)
      newBlockSize = blockWidthSize;

    if (props.maxBlockSize !== undefined && newBlockSize > props.maxBlockSize)
      newBlockSize = props.maxBlockSize;

    setBlockSize(newBlockSize);

  }, [props.width, props.height, props.maxBlockSize]);

  return (

    <Box
      component='table'
      sx={{
        borderSpacing: borderSpacing,
      }}>

      <Box
        component='tbody'>

        {previewBoard.map((blockRow, rowIndex) => {

          return (
            <Box
              key={rowIndex}
              component='tr'>

              {blockRow.map((block, blockIndex) => {

                var blockStyle = block.style;
                if (props.tetromino && props.tetromino.matrix[0][rowIndex][blockIndex] > 0)
                  blockStyle = props.tetromino.style;

                return (
                  <Box
                    key={blockIndex}
                    component='td'
                    sx={{
                      height: blockSize,
                      width: blockSize,
                      ...blockStyle
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
}

export default TetrominoRenderer;