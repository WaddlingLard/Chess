import React, { useState, useEffect, createContext, useRef, useMemo } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import ChessPiece, { PIECE_TYPE } from "./ChessPiece";

export const TileContext = createContext(undefined);
export const DEFAULT_BOARD_DIMENSION = 8;
export const DEFAULT_TILE_SIZE = 60

// The typical layout for a chessboard
export const DEFAULT_PIECE_LAYOUT = [
    [],
    [],
    [...Array(DEFAULT_BOARD_DIMENSION).fill(PIECE_TYPE.PAWN)],
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

    // console.log("Empty grid created!", emptyGrid);

    return emptyGrid;
};

function Chessboard({
    boardWidth,
    boardHeight,
    // renderScale,
    chessPieceLayout,
    template = { tempPieceLayout: getEmptyPieceGrid(DEFAULT_BOARD_DIMENSION), setTempPieceLayout: null },
}) {
    
    // const { tempPieceLayout, setTempPieceLayout } = template;

    const [dimension, setDimension] = useState({
        width: undefined,
        height: undefined
    });
    
    const [gameGrid, setGameGrid] = useState({ grid: [] });
    
    const [pieceLayout, setPieceLayout] = useState({
        grid: [],
    });

    // const [gameGridCreated, setGameGridCreated] = useState(false);
    // const [tileRenderSize, setTileRenderSize] = useState(DEFAULT_TILE_SIZE);

    // SHOULD MAKE THIS A GLOBAL STATE (MOVE LATER)
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [errorFlag, setErrorFlag] = useState(false);

    useEffect(() => {
        // Use default value instead if failed to pass params
        const useDefaultDimension = boardWidth === undefined || boardHeight === undefined;
        const useDefaultPieceLayout = chessPieceLayout === undefined;
        
        setPieceLayout((prev) => ({
            grid: useDefaultPieceLayout ? DEFAULT_PIECE_LAYOUT : chessPieceLayout,
        }));

        setDimension((prev) => ({
            width: useDefaultDimension ? DEFAULT_BOARD_DIMENSION : boardWidth,
            height: useDefaultDimension ? DEFAULT_BOARD_DIMENSION : boardHeight
        }));
    
    }, []);

    // Build the game grid after the dimensions are set
    useEffect(() => {
        if (!dimension.width || !dimension.height) {
            return;
        }

        // Odd number of rows is not possible (imbalence of the board)
        if (dimension.height % 2 == 1) {
            setErrorMessage("The provided height for the board is odd (will cause an imbalence in the board)");
            setErrorFlag(true);
        }

        const newGameGrid = buildGameGrid(dimension.width, dimension.height);
        const pieceGrid = pieceLayout.grid;

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

        // setGameGridCreated(true);
    }, [dimension]);

    const buildGameGrid = (width, height) => {
        
        const grid = [];
        const colList = Array(width);
        const rowList = Array(height);

        // Iterate over the dimensions to make a base grid
        for (let row = 0; row < rowList.length; row++) {
            grid.push([]);
            for (let col = 0; col < colList.length; col++) {
                const tileLocation = { x: col, y: row };
                grid[row][col] = tileLocation; 
            }
        }

        return grid;
    }

    const drawBoard = (grid, { width, height }) => {
        console.log('passed in grid:', grid);
        const currentGrid = [...grid];

        // The piece layout grid represents the bottom-half of the board, will need to be mirrored for the top-half
        const chessPieceGrid = [...pieceLayout.grid];
        // let isGridReversed = false; // Used as a flag to prevent any further mutation

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
            // <TileContext value={{ tileSize: tileRenderSize }}>
            <>
                {gameGrid.grid.map((gridRow, rowIndex) => {
                    
                    // Checks if time to generate other teams pieces, reverses and ensures only happens once
                    // isOtherTeam(rowIndex) && !isGridReversed
                    //     ? (chessPieceGrid.reverse(), (isGridReversed = true))
                    //     : null;


                    // [['p'],['p'],[],[],[],[],['p'],['p']]
                //    ^^
                    // [[],[],['pieces'],['pieces']]
                //                          ^^ 

                    const currentPieceRow = chessPieceGrid[isOtherTeam(rowIndex) 
                        ? rowIndex % chessPieceGrid.length 
                        : chessPieceGrid.length - 1 - (rowIndex % chessPieceGrid.length)];
                    const ignorePieceRow = currentPieceRow.length !== height;

                    // console.log(currentPieceRow, rowIndex, chessPieceGrid.length - 1 - (rowIndex % chessPieceGrid.length))

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
                                const data = { location: tile };

                                if (ignorePieceRow) {
                                    data.piece = null;
                                } else {
                                    // Check if there is a piece in the location
                                    data.piece = currentPieceRow[colIndex].length === 0 ? null : currentPieceRow[colIndex];
                                    // data.piece = chessPiece == null ? null : chessPiece[0];
                                }

                                // console.log("New tile data!", data);
                                const chessTile = (
                                    <ChessTile
                                        key={`${rowIndex}${colIndex}`}
                                        constructorData={data}
                                        // templateGrid={{ tempPieceLayout, setTempPieceLayout }}
                                    />
                                );
                                currentGrid[rowIndex][colIndex].tileData = data;

                                return chessTile;
                            })}
                        </div>
                    );
                })}
            </>
            // </TileContext>
        );

        const updatedGrid = currentGrid;

        return { component: component, value: updatedGrid };
    };

    const getInitialBoard = () => {
        if (gameGrid.grid.length == 0 || !dimension.width || !dimension.height) {
            return { component: null, value: null };
        }
        // console.log(gameGrid.grid)
        return drawBoard(gameGrid.grid, dimension);
    }

    // Update the gameGrid when the memoized function getMemoizedBoard has created a new value
    // useEffect(() => {
    //     if (gameGrid.grid) {
    //         const updatedGrid = drawBoard(gameGrid.grid, dimension).value;
    //         setGameGrid((prev) => ({ ...prev, grid: updatedGrid }));
    //     }
    // }, [getMemoizedBoard]);

    // Styles rules here
    const styles = {
        chessBoard: {
            // width: `${tileRenderSize * dimension.width}px`,
            // height: `${tileRenderSize * dimension.height}px`,
            width: `${DEFAULT_TILE_SIZE * dimension.width}px`,
            height: `${DEFAULT_TILE_SIZE * dimension.height}px`,
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

    if (gameGrid.grid) {
        // console.log("Reloading board!", getMemoizedBoard.component);
        console.log("Reloading Board!");
    }

    return (
        <>
            {/* Draw the board */}
            <div style={{ ...styles.chessBoard }}>{getInitialBoard().component || <p>Loading the board</p>}</div>
        </>
    );
}

export default Chessboard;
