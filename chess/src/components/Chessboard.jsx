import React, { useState, useEffect, createContext } from 'react';
import '../css/chessboard.css';
import ChessTile from './ChessTile';

export const TileContext = createContext(undefined);

function Chessboard({ width, height }) {

    const [dimension, setDimension] = useState({ width: undefined, height: undefined, setValue: false });
    const [gameGrid, setGameGrid] = useState({ grid: [] });
    const DEFAULT_TILE_SIZE = 60;

    // Initialize the dimensions for the game board
    useEffect(() => {
        if (width == undefined || height == undefined) {
            throw new Error("Dimensions not provided to the game board constructor");
        }

        // The naming is a little redundant but will do for now
        setDimension((prev) => ({ width: width, height: height, setValue: true }));
    }, [])

    // Build the game grid after the dimensions are set
    useEffect(() => {
        if (!dimension.setValue) {
            return;
        }
        const newGameGrid = buildGameGrid();
        setGameGrid({ grid: newGameGrid });
    }, [dimension])

    const buildGameGrid = () => {

        const grid = [];
        const colList = Array(dimension.width);
        const rowList = Array(dimension.height);

        // Build the grid
        for (let row = 0; row < rowList.length; row++) {
            console.log('new row!')
            grid[row] = [];
            for (let col = 0; col < colList.length; col++) {
                console.log('new col!')
                const position = { x: col, y: row };
                grid[row][col] = [position];
            }
        }
        return grid;
    }

    // setTimeout(() => { console.log(gameGrid.grid) }, 1000);

    const drawBoard = (width, height) => (
        <TileContext value={{ tileSize: DEFAULT_TILE_SIZE }}>
            {gameGrid.grid.map((gridRow, rowIndex) => (

                <div
                    key={rowIndex}
                    style={{
                        width: 'fit-content', height: 'fit-content',
                    }}
                >
                    {gridRow.map((tile, colIndex) => (
                        <ChessTile key={colIndex} location={tile[0]} />
                    ))}
                </div>

            ))}
        </TileContext>
    )

    return (
        <>
            {/* Draw the board */}
            <div
                style={{
                    width: `${(DEFAULT_TILE_SIZE) * dimension.width}px`,
                    height: `${(DEFAULT_TILE_SIZE) * dimension.height}px`,
                    // width: 'fit-content',
                    // height: 'fit-content',
                    // aspectRatio: 1 / 1,
                    // margin: 'auto',
                    // padding: '5%',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${dimension.width}, 1fr)`,
                    padding: '6%',
                    // margin: '5%',
                    borderRadius: '24px',
                    // flexDirection: 'row',
                    justifyContent: 'center',
                    // justifySelf: 'center',
                    // alignItems: 'center',
                    backgroundColor: '#55342B',
                    // overflow: 'hidden',
                    // zIndex: 2,
                    // boxSizing: 'border-box',
                }}
            >
                {/* <div style={{
                    display: 'flex',
                    margin: 'auto'
                }}> */}
                {drawBoard(dimension.width, dimension.height)}

                {/* </div> */}


            </div>
        </>
    )
}

export default Chessboard;