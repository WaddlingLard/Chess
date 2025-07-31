import React, { useState, useEffect, createContext } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import ChessPiece from "./ChessPiece";
import { PIECE_TYPE } from "./ChessPiece";

export const TileContext = createContext(undefined);
export const DEFAULT_BOARD_DIMENSION = 8;

// The typical layout for a chessboard
export const DEFAULT_PIECE_LAYOUT = [
    [
        PIECE_TYPE.ROOK,
        PIECE_TYPE.KNIGHT,
        PIECE_TYPE.BISHOP,
        PIECE_TYPE.QUEEN,
        PIECE_TYPE.KING,
        PIECE_TYPE.BISHOP,
        PIECE_TYPE.KNIGHT,
        PIECE_TYPE.ROOK,
    ],
    [...Array(DEFAULT_BOARD_DIMENSION).fill(PIECE_TYPE.PAWN)],
    [],
    [],
];

function Chessboard({
    boardWidth,
    boardHeight,
    renderScale,
    chessPieceLayout,
}) {
    const DEFAULT_TILE_SIZE = 60;
    const [dimension, setDimension] = useState({
        width: undefined,
        height: undefined,
        valueSet: false,
    });
    const [gameGrid, setGameGrid] = useState({ grid: [] });
    const [pieceLayout, setPieceLayout] = useState({ pieceGrid: [] });
    const [tileRenderSize, setTileRenderSize] = useState(DEFAULT_TILE_SIZE);

    // SHOULD MAKE THIS A GLOBAL STATE (MOVE LATER)
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [errorFlag, setErrorFlag] = useState(false);

    // Initialize the dimensions/size for the game board
    useEffect(() => {
        // Use default value instead if failed to pass params
        const useDefaultDimension =
            boardWidth === undefined || boardHeight === undefined;

        const useDefaultPieceLayout = chessPieceLayout === undefined;

        // console.log(useDefaultPieceLayout, chessPieceLayout);

        setPieceLayout((prev) => ({
            pieceGrid: useDefaultPieceLayout
                ? DEFAULT_PIECE_LAYOUT
                : chessPieceLayout,
        }));

        // The naming is a little redundant but will do for now
        setDimension((prev) => ({
            width: useDefaultDimension ? DEFAULT_BOARD_DIMENSION : boardWidth,
            height: useDefaultDimension ? DEFAULT_BOARD_DIMENSION : boardHeight,
            valueSet: true,
        }));

        // Apply rendering scale if exists
        renderScale === undefined
            ? console.log("No render scale provided! Using default!")
            : setTileRenderSize(tileRenderSize * renderScale);
    }, []);

    // Build the game grid after the dimensions are set
    useEffect(() => {
        if (!dimension.valueSet) {
            return;
        }

        // Odd number of rows is not possible (imbalence of the board)
        if (dimension.height % 2 == 1) {
            setErrorMessage(
                "The provided height for the board is odd (will cause an imbalence in the board)"
            );
            setErrorFlag(true);
        }

        const newGameGrid = buildGameGrid();
        const pieceGrid = pieceLayout.pieceGrid;

        // Does the game grid match with the piece layout dimensions?
        if (
            newGameGrid.length / 2 !== pieceGrid.length ||
            newGameGrid[0].length !== pieceGrid[0].length
        ) {
            setErrorMessage(
                `Provided piece layout does not match up with the dimensions of the chess board ${
                    newGameGrid.length / 2
                } !== ${pieceGrid.length} || ${newGameGrid[0].length} !== ${
                    pieceGrid[0].length
                } (Rare bug spawn)`
            );
            setErrorFlag(true);
        }

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
        const chessPieceGrid = [...pieceLayout.pieceGrid];
        let isGridReversed = false; // Used as a flag to prevent any further mutation

        // console.log(chessPieceGrid);

        const isOtherTeam = (currentRow) => {
            return currentRow >= height / 2;
        };

        if (grid.length !== height) {
            setErrorMessage(
                `Grid does not match the provided height! ${grid.length} !== ${height}`
            );
            setErrorFlag(true);
        }

        if (grid[0].length !== width) {
            setErrorMessage(
                `Grid does not match the provided width! ${grid[0].length} !== ${width}`
            );
            setErrorFlag(true);
        }

        const component = (
            <TileContext value={{ tileSize: tileRenderSize }}>
                {gameGrid.grid.map((gridRow, rowIndex) => {
                    // Checks if time to generate other teams pieces, reverses and ensures only happens once
                    isOtherTeam(rowIndex) && !isGridReversed
                        ? (chessPieceGrid.reverse(), (isGridReversed = true))
                        : null;

                    // Grab the current array and reverse if on the other team
                    let currentPieceRow = chessPieceGrid[rowIndex % 4];

                    return (
                        <div
                            key={rowIndex}
                            style={{
                                display: "flex",
                                width: "fit-content",
                                height: "fit-content",
                            }}
                        >
                            {gridRow.map((tile, colIndex) => {
                                // ALTER HERE TO CHANGE INITIAL CONSTRUCTOR DATA
                                const chessPiece = currentPieceRow[colIndex];
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
                    );
                })}
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
            // padding: "5%",
            display: "grid",
            gridTemplateRows: `repeat(${dimension.height}, 1fr)`,
            padding: "1em",
            // margin: '5%',
            borderRadius: "24px",
            borderStyle: "solid",
            borderWidth: "3px",
            borderColor: "#000",
            // flexDirection: 'row',
            justifyContent: "center",
            // justifySelf: 'center',
            // alignItems: 'center',
            backgroundColor: "#55342B",
            // overflow: 'hidden',
            // zIndex: 2,
            boxSizing: "content-box",
            // outline: "2px solid red",
            // alignSelf: "center",
        },
    };

    if (errorFlag) {
        return (
            <>
                <h1>ERROR!</h1>
                <p> {errorMessage} </p>
            </>
        );
    }

    return (
        <>
            {/* Draw the board */}
            <div
                style={{ ...styles.chessBoard }}
                // className='chessboard'
            >
                {/* {errorFlag && <p> {errorMessage} </p>} */}
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
