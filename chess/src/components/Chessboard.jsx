import React, { useState, useEffect, createContext, useRef, useMemo } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import ChessPiece, { PIECE_TYPE } from "./ChessPiece";

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

// looks intense, but all it is doing is constructing an array based on the
// height of the board to represent the rows and then each 'row' has the
// rep of the columns to build up the whole grid
// ALSO MUST CONSIDER ODD NUMBERED VALUES
export const getEmptyPieceGrid = (height, width) => {
    return Array(height / 2)
        .fill(null)
        .map(() => {
            return Array(width)
                .fill(null)
                .map(() => {
                    return [];
                });
        });
};

function Chessboard({ boardWidth, boardHeight, renderScale, chessPieceLayout }) {
    const DEFAULT_TILE_SIZE = 60;
    const [dimension, setDimension] = useState({
        width: undefined,
        height: undefined,
        valueSet: false,
    });
    const [gameGrid, setGameGrid] = useState({ grid: [] });
    const [pieceLayout, setPieceLayout] = useState({
        pieceGrid: [],
        // getEmptyPieceGrid(boardHeight === undefined ? DEFAULT_BOARD_DIMENSION : boardHeight),
    });
    const [gameGridCreated, setGameGridCreated] = useState(false);
    const [tileRenderSize, setTileRenderSize] = useState(DEFAULT_TILE_SIZE);

    // SHOULD MAKE THIS A GLOBAL STATE (MOVE LATER)
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [errorFlag, setErrorFlag] = useState(false);

    // Reset the board states if there is a new chess piece layout
    useEffect(() => {
        console.log("Chessboard: new layout received!", chessPieceLayout);
        // if (gameGrid.grid != undefined) {
        //     setGameGrid((prev) => ({ grid: [] }));
        // }
    }, [chessPieceLayout]);

    // Initialize the dimensions/size for the game board
    useEffect(() => {
        // Use default value instead if failed to pass params
        const useDefaultDimension = boardWidth === undefined || boardHeight === undefined;
        const useDefaultPieceLayout = chessPieceLayout === undefined;

        // console.log(useDefaultPieceLayout, chessPieceLayout);

        setPieceLayout((prev) => ({
            pieceGrid: useDefaultPieceLayout ? DEFAULT_PIECE_LAYOUT : chessPieceLayout,
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
            : setTileRenderSize(DEFAULT_TILE_SIZE * renderScale);
    }, [chessPieceLayout]);

    // Build the game grid after the dimensions are set
    useEffect(() => {
        if (!dimension.valueSet) {
            return;
        }

        // Odd number of rows is not possible (imbalence of the board)
        if (dimension.height % 2 == 1) {
            setErrorMessage("The provided height for the board is odd (will cause an imbalence in the board)");
            setErrorFlag(true);
        }

        const newGameGrid = buildGameGrid;

        console.log("New game grid:", newGameGrid);

        const pieceGrid = pieceLayout.pieceGrid;

        // Does the game grid match with the piece layout dimension?
        if (
            newGameGrid.length / 2 !==
            pieceGrid.length
            // ||
            // newGameGrid[0].length !== pieceGrid[0].length
        ) {
            setErrorMessage(
                `Provided piece layout does not match up with the dimensions of the chess board ${
                    newGameGrid.length / 2
                } !== ${pieceGrid.length}`
                // || ${newGameGrid[0].length} !== ${
                //     pieceGrid[0].length
                // } (Rare bug spawn)`
            );
            setErrorFlag(true);
        }

        setGameGrid({ grid: newGameGrid });
        setGameGridCreated(true);
    }, [dimension]);

    const buildGameGrid = useMemo(() => {
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
    }, [dimension.width, dimension.height]);

    const drawBoard = (grid, { width, height }) => {
        const currentGrid = [...grid];
        const chessPieceGrid = [...pieceLayout.pieceGrid];
        let isGridReversed = false; // Used as a flag to prevent any further mutation

        console.log("Passed in grid: ", grid);
        console.log("Chess grid: ", chessPieceGrid);

        const isOtherTeam = (currentRow) => {
            return currentRow >= height / 2;
        };

        if (grid.length !== height) {
            setErrorMessage(`Grid does not match the provided height! ${grid.length} !== ${height}`);
            setErrorFlag(true);
        }

        if (grid[0].length !== width) {
            setErrorMessage(`Grid does not match the provided width! ${grid[0].length} !== ${width}`);
            setErrorFlag(true);
        }

        const component = (
            <TileContext value={{ tileSize: tileRenderSize }}>
                {gameGrid.grid.map((gridRow, rowIndex) => {
                    // Checks if time to generate other teams pieces, reverses and ensures only happens once
                    isOtherTeam(rowIndex) && !isGridReversed
                        ? (chessPieceGrid.reverse(), (isGridReversed = true))
                        : null;

                    const ignorePieceRow = chessPieceGrid[rowIndex % 4].length <= 1;
                    let currentPieceRow = chessPieceGrid[rowIndex % 4];

                    // Account for an empty array representing the whole row

                    // console.log(currentPieceRow);

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
                                // console.log(colIndex);
                                const data = {
                                    location: tile[0],
                                    piece: ignorePieceRow ? null : currentPieceRow[colIndex],
                                };

                                // console.log("regenerating tile!");
                                const chessTile = <ChessTile key={colIndex} constructorData={data} />;
                                currentGrid[rowIndex][colIndex].tileData = data;

                                return chessTile;
                            })}
                        </div>
                    );
                })}
            </TileContext>
        );

        const updatedGrid = currentGrid;

        console.log("Draw Board Component: ", component);
        console.log("Draw Board Value: ", updatedGrid);

        return { component: component, value: updatedGrid };
    };

    const getMemoizedBoard = useMemo(() => {
        if (!gameGridCreated) {
            return null;
        }
        return drawBoard(gameGrid.grid, dimension);
    }, [pieceLayout.pieceGrid, gameGridCreated, dimension]);

    // Update the gameGrid when the memoized function getMemoizedBoard has created a new value
    useEffect(() => {
        if (gameGridCreated) {
            const updatedGrid = drawBoard(gameGrid.grid, dimension).value;
            setGameGrid((prev) => ({ ...prev, grid: updatedGrid }));
        }
    }, [getMemoizedBoard]);

    // Use a saved conditional to have a useEffect to store the value from
    // the component while also generating the HTML as well.
    // const generateBoard = () => {
    //     if (gameGridCreated) {
    //         console.log("Getting memoized component!");
    //         return getMemoizedBoard.component;
    //     }
    //     return "bruh";
    // };

    // const generateBoard = gameGridCreated ? (getMemoizedBoard.component, console.log("getting component")) : "bruh";

    // Cannot generate board until certain vals are set (check to determine if rest of code should execute)
    // if (!dimension.valueSet) {
    //     return null;
    // }

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

    // Error output insurance
    if (errorFlag) {
        return (
            <>
                <h1>ERROR!</h1>
                <p> {errorMessage} </p>
            </>
        );
    }

    if (gameGridCreated) {
        console.log("Reloading board!", getMemoizedBoard.component);
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

                {getMemoizedBoard?.component || <p>Loading the board</p>}

                {/* </div> */}
            </div>
        </>
    );
}

export default Chessboard;
