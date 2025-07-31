import React, { useState, useEffect, createContext } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import ChessPiece from "./ChessPiece";
import { PIECE_TYPE } from "./ChessPiece";

export const TileContext = createContext(undefined);
export const DEFAULT_PIECE_LAYOUT = [];
export const DEFAULT_BOARD_DIMENSION = 8;

function Chessboard({ boardWidth, boardHeight, renderScale }) {
    const [dimension, setDimension] = useState({
        width: undefined,
        height: undefined,
        valueSet: false,
    });
    const [gameGrid, setGameGrid] = useState({ grid: [] });
    const [tileRenderSize, setTileRenderSize] = useState(DEFAULT_TILE_SIZE);
    const DEFAULT_TILE_SIZE = 60;

    // Initialize the dimensions/size for the game board
    useEffect(() => {
        // Use default value instead if failed to pass params
        const useDefaultDimension =
            boardWidth === undefined || boardHeight === undefined
                ? true
                : false;

        // The naming is a little redundant but will do for now
        setDimension((prev) => ({
            width: useDefaultDimension ? DEFAULT_BOARD_DIMENSION : boardWidth,
            height: useDefaultDimension ? DEFAULT_BOARD_DIMENSION : boardHeight,
            valueSet: true,
        }));

        // Apply rendering scale if exists
        renderScale === undefined
            ? none
            : setTileRenderSize(tileRenderSize * renderScale);

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

        // Iterate over the dimensions to make a base grid
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
    };

    const drawBoard = (grid, { width, height }) => {
        const currentGrid = [...grid];
        const isFirstRow = (currentRow) => {
            return currentRow == 0;
        };

        if (grid.length !== height) {
            throw new Error(
                `Grid does not match the provided height! ${grid.length} !== ${height}`
            );
        }

        if (grid[0].length !== width) {
            throw new Error(
                `Grid does not match the provided width! ${grid[0].length} !== ${width}`
            );
        }

        const component = (
            // I KNOW THIS MAPPING IS WORDED WRONG COL <=> ROW, NEED TO FIX (will procrastinate in the meantime)
            <TileContext value={{ tileSize: tileRenderSize }}>
                {gameGrid.grid.map((gridRow, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{
                            width: "fit-content",
                            height: "fit-content",
                        }}
                    >
                        {gridRow.map((tile, colIndex) => {
                            //   const isFinalTile =
                            //     rowIndex === height - 1 && colIndex === width - 1
                            //       ? true
                            //       : false;

                            // ALTER HERE TO CHANGE INITIAL CONSTRUCTOR DATA
                            // TEMP: Make pawns here (HANDLE PIECE CREATION LOGIC ELSEWHERE)
                            const chessPiece = isFirstRow(colIndex)
                                ? PIECE_TYPE.PAWN
                                : undefined;
                            const data = {
                                location: tile[0],
                                piece: chessPiece,
                            };

                            const chessTile = (
                                <ChessTile
                                    key={colIndex}
                                    constructorData={data}
                                />
                            );
                            currentGrid[rowIndex][colIndex].tileData = data;
                            return chessTile;
                        })}
                    </div>
                ))}
            </TileContext>
        );

        const updatedGrid = currentGrid;

        // console.log(`Updated Grid`, updatedGrid);

        return { component, value: updatedGrid };
    };

    // Use a saved conditional to have a useEffect to store the value from
    // the component while also generating the HTML as well.
    const gameGridCreated = gameGrid.grid.length !== 0;
    const generateBoard = gameGridCreated
        ? drawBoard(gameGrid.grid, dimension).component
        : null;

    useEffect(() => {
        if (gameGridCreated) {
            const updatedGrid = drawBoard(gameGrid.grid, dimension).value;
            setGameGrid((prev) => ({ ...prev, grid: updatedGrid }));
        }
    }, [gameGridCreated]);

    // Styles rules here
    const styles = {
        chessBoard: {
            width: `${tileRenderSize * dimension.width}px`,
            height: `${tileRenderSize * dimension.height}px`,
            // width: 'fit-content',
            // height: 'fit-content',
            // aspectRatio: 1 / 1,
            // margin: 'auto',
            // padding: '5%',
            display: "grid",
            gridTemplateColumns: `repeat(${dimension.width}, 1fr)`,
            padding: "6%",
            // margin: '5%',
            borderRadius: "24px",
            // flexDirection: 'row',
            justifyContent: "center",
            // justifySelf: 'center',
            // alignItems: 'center',
            backgroundColor: "#55342B",
            // overflow: 'hidden',
            // zIndex: 2,
            // boxSizing: 'border-box',
        },
    };

    return (
        <>
            {/* Draw the board */}
            <div
                style={{ ...styles.chessBoard }}
                // className='chessboard'
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
    );
}

export default Chessboard;
