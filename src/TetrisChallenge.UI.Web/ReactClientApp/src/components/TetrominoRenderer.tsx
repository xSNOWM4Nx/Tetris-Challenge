import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { ITetrominoBlock, IGameBoardBlock, getGameBoard } from './../types';

interface ILocalProps {
  tetromino: ITetrominoBlock;
  blockSize: number;
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
  const [previewBoard, setPreviewBoard] = useState<Array<Array<IGameBoardBlock>>>(getGameBoard(previewBoardBlockCount, previewBoardBlockCount));

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
                      height: props.blockSize,
                      width: props.blockSize,
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