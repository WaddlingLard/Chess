import React, { useState, useEffect, createContext, Children } from 'react';
import '../css/chessboard.css';
import ChessTile from './ChessTile';

export const TileContext = createContext(undefined);

function Chessboard({ width, height }) {

    const [dimension, setDimension] = useState({ width: undefined, height: undefined, valueSet: false });
    const [gameGrid, setGameGrid] = useState({ grid: [] });
    const DEFAULT_TILE_SIZE = 60;

    // Initialize the dimensions for the game board
    useEffect(() => {
        if (width == undefined || height == undefined) {
            throw new Error("Dimensions not provided to the game board constructor");
        }

        // The naming is a little redundant but will do for now
        setDimension((prev) => ({ width: width, height: height, valueSet: true }));
        // console.log('Dimension has been set!');
    }, []);

    // Build the game grid after the dimensions are set
    useEffect(() => {
        if (!dimension.valueSet) {
            return;
        }
        const newGameGrid = buildGameGrid();
        setGameGrid({ grid: newGameGrid });
    }, [dimension]);


    const buildGameGrid = () => {

        const grid = [];
        const colList = Array(dimension.width);
        const rowList = Array(dimension.height);

        // Build the grid
        for (let row = 0; row < rowList.length; row++) {
            // console.log('new row!')
            grid[row] = [];
            for (let col = 0; col < colList.length; col++) {
                // console.log('new col!')
                const tileLocation = { x: col, y: row };
                grid[row][col] = [tileLocation];
            }
        }
        return grid;
    }

    const drawBoard = (grid, { width, height }) => {

        const currentGrid = [...grid];

        if (grid.length !== height) {
            throw new Error(`Grid does not match the provided height! ${grid.length} !== ${height}`);
        }

        if (grid[0].length !== width) {
            throw new Error(`Grid does not match the provided width! ${grid[0].length} !== ${width}`);
        }
        // TRYING TO SAVE ALL CHESSTILES INTO THE GAMEGRID

        const component = (
            <TileContext value={{ tileSize: DEFAULT_TILE_SIZE }}>
                {gameGrid.grid.map((gridRow, rowIndex) => (

                    <div
                        key={rowIndex}
                        style={{
                            width: 'fit-content', height: 'fit-content',
                        }}
                    >
                        {gridRow.map((tile, colIndex) => {
                            const isFinalTile = (rowIndex === height - 1 && colIndex === width - 1) ? true : false;

                            // ALTER HERE TO CHANGE INITIAL CONSTRUCTOR DATA
                            const data = { location: tile[0], };
                            const chessTile = <ChessTile key={colIndex} constructorData={data} />;
                            currentGrid[rowIndex][colIndex].tileData = data;
                            return (chessTile);
                        })}
                    </div>

                ))}
            </TileContext>
        );

        const updatedGrid = currentGrid;

        // console.log(`Updated Grid`, updatedGrid);

        return { component, value: updatedGrid };
    }

    // Use a saved conditional to have a useEffect to store the value from
    // the component while also generating the HTML as well.
    const gameGridCreated = gameGrid.grid.length !== 0;
    const generateBoard = gameGridCreated ? drawBoard(gameGrid.grid, dimension).component : null;

    useEffect(() => {
        if (gameGridCreated) {
            const updatedGrid = drawBoard(gameGrid.grid, dimension).value;
            setGameGrid((prev) => ({ ...prev, grid: updatedGrid }));
        }
    }, [gameGridCreated])

    // Styles rules here
    const styles = ({
        chessBoard: {
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
        }
    });

    return (
        <>
            {/* Draw the board */}
            <div
                style={{ ...styles.chessBoard }}
            >
                {/* <div style={{
                    display: 'flex',
                    margin: 'auto'
                }}> */}
                {/* {gameGrid.grid.length !== 0 && drawBoard(gameGrid.grid, dimension)} */}

                {generateBoard}

                {/* </div> */}


            </div>
        </>
    )
}

export default Chessboard;