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
    if (width === undefined) {
        width = height;
    }
    const emptyGrid = Array(height / 2)
        .fill(null)
        .map(() => {
            return Array(width)
                .fill(null)
                .map(() => {
                    return [];
                });
        });

    console.log("Empty grid created!", emptyGrid);

    return emptyGrid;
};

function Chessboard({ boardWidth, boardHeight, renderScale, chessPieceLayout, template }) {
    const { tempPieceLayout, setTempPieceLayout } = template;

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

    // Initialize the dimensions/size for the game board
    useEffect(() => {
        // Use default value instead if failed to pass params
        const useDefaultDimension = boardWidth === undefined || boardHeight === undefined;
        const useDefaultPieceLayout = chessPieceLayout === undefined;
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
        const pieceGrid = pieceLayout.pieceGrid;

        // Does the game grid match with the piece layout dimension?
        if (newGameGrid.length / 2 !== pieceGrid.length) {
            setErrorMessage(
                `Provided piece layout does not match up with the dimensions of the chess board ${
                    newGameGrid.length / 2
                } !== ${pieceGrid.length}`
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

                    const currentRow = chessPieceGrid[rowIndex % 4];

                    const ignorePieceRow = currentRow.length !== dimension.height;

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
                                const data = { location: tile[0] };

                                if (ignorePieceRow) {
                                    data.piece = null;
                                } else {
                                    // Check if there is a piece in the location
                                    data.piece = currentRow[colIndex].length === 0 ? null : currentRow[colIndex];
                                }

                                console.log("New tile data!", data);
                                const chessTile = (
                                    <ChessTile
                                        key={`${rowIndex}${colIndex}`}
                                        constructorData={data}
                                        currentGrid={{ gameGrid, setTempPieceLayout }}
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

    // Styles rules here
    const styles = {
        chessBoard: {
            width: `${tileRenderSize * dimension.width}px`,
            height: `${tileRenderSize * dimension.height}px`,
            display: "grid",
            gridTemplateRows: `repeat(${dimension.height}, 1fr)`,
            padding: "1em",
            borderRadius: "24px",
            borderStyle: "solid",
            borderWidth: "3px",
            borderColor: "#000",
            justifyContent: "center",
            backgroundColor: "#55342B",
            boxSizing: "content-box",
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
            <div style={{ ...styles.chessBoard }}>{getMemoizedBoard?.component || <p>Loading the board</p>}</div>
        </>
    );
}

export default Chessboard;
