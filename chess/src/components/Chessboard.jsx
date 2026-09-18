import React, { useState, useEffect, createContext, useRef, useMemo } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import ChessPiece, { PIECE_TYPE } from "./ChessPiece";
import { GAME_STATUS, useGame } from "../contexts/GameContext";

// export const TileContext = createContext(undefined);
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
// ALSO MUST CONSIDER ODD NUMBERED VALUES* Eventually
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
    // const { boardState, setBoardState } = useGame();
    const { gameStatus, setGameStatus } = useGame();

    const [dimension, setDimension] = useState({
        width: undefined,
        height: undefined
    });
    
    const [chessBoard, setChessBoard] = useState({ board: [] });   
    const [boardSignature, setBoardSignature] = useState(null);
    const [pieceLayout, setPieceLayout] = useState({ grid: [] });
    const [gameStarted, setGameStarted] = useState(false);

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
        // NOTE: Might be fine, for later
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

        setChessBoard({ board: newGameGrid });

        // setGameGridCreated(true);
    }, [dimension]);

    useEffect(() => {
        if (!chessBoard.board) return;
        setBoardSignature(JSON.stringify(chessBoard.board));
    }, [chessBoard]);

    useEffect(() => {
        if (gameStarted) {
            setGameStatus(GAME_STATUS.IN_PROGRESS);
        }
    }, [gameStarted]);

    /**
     * Builds a grid with the provided measurements
     * @param {number} width 
     * @param {number} height 
     * @returns {Array<Array<Record<"x" | "y", number>>}
     */
    const buildGameGrid = (width, height) => {
        
        /**@type {Array<Array<Object>>} */
        const grid = [];

        // Iterate over the dimensions to make a base grid
        for (let row = 0; row < width; row++) {
            grid.push([]);
            for (let col = 0; col < height; col++) {
                const tileLocation = { x: col, y: row };
                grid[row][col] = tileLocation; 
            }
        }

        return grid;
    }

    /**
     * @typedef {Object} BoardReturn
     * @property {Element | null} component
     * @property {Array<Array<Object>> | null} value
     */

    /**
     * Draw in the board with the new/initial data
     * @param {Array<Array<Object>>} gameGrid 
     * @returns {BoardReturn}
     */
    const drawBoard = (gameGrid, pieceGrid) => {
        
        const { board } = gameGrid;
        const currentBoard = [...board];

        // The piece layout grid represents the bottom-half of the board, will need to be mirrored for the top-half
        const { grid } = pieceGrid;
        const chessPieceGrid = [...grid];
       
        const isOtherTeam = (currentRow) => {
            return currentRow >= currentBoard.length / 2;
        };

        const gameInProgress = gameStatus === GAME_STATUS.IN_PROGRESS;
        console.log(gameInProgress, currentBoard);
        

        const component = gameInProgress ? (
            <>
                {currentBoard.map((gridRow, rIdx) => {
                    return (
                        <div
                            key={rIdx}
                            style={{
                                display: "flex",
                                width: "fit-content",
                                height: "fit-content",
                            }}
                        >
                        {gridRow.map((tile, cIdx) => {
                            return (
                                <ChessTile
                                    key={`${rIdx}${cIdx}`}
                                    constructorData={currentBoard[rIdx][cIdx]}
                                    updateBoard={{chessBoard, setChessBoard}}
                                    // templateGrid={{ tempPieceLayout, setTempPieceLayout }}
                                />
                            );
                        })}
                        </div>
                    )
                })}
            </>
        ) : (
            <>
                {currentBoard.map((gridRow, rIdx) => {
                    
                    const currentPieceRow = chessPieceGrid[isOtherTeam(rIdx) 
                        ? rIdx % chessPieceGrid.length 
                        : chessPieceGrid.length - 1 - (rIdx % chessPieceGrid.length)];
                    const ignorePieceRow = currentPieceRow.length !== currentBoard[0].length;

                    return (
                        <div
                            key={rIdx}
                            style={{
                                display: "flex",
                                width: "fit-content",
                                height: "fit-content",
                            }}
                        >
                            {gridRow.map((tile, cIdx) => {
                                const data = {};
                                data.tile = { selected: false };

                                if (ignorePieceRow) {
                                    data.piece = null;
                                } else {
                                    data.piece = { ...currentPieceRow[cIdx] };
                                    data.piece.team = isOtherTeam(rIdx) ? "BLACK" : "WHITE"
                                }

                                currentBoard[rIdx][cIdx] = Object.assign(currentBoard[rIdx][cIdx], data);

                                return (
                                    <ChessTile
                                        key={`${rIdx}${cIdx}`}
                                        constructorData={currentBoard[rIdx][cIdx]}
                                        updateBoard={{chessBoard, setChessBoard}}
                                        // templateGrid={{ tempPieceLayout, setTempPieceLayout }}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </>
            // </TileContext>
        );

        console.log(component);
        const updatedGrid = currentBoard;
        // console.log("Updated Grid: ", updatedGrid);

        return { component: component, value: updatedGrid };
    };

    /**
     * Validates board if it is setup with proper dimensions
     * @param {Array<Array<any>>} board 
     * @param {number} width 
     * @param {number} height 
     * @returns {boolean}
     */
    const validateBoard = (board, width, height) => {
        if (width === undefined || height === undefined || !board) {
            return false;
        } else if (board.length !== width || board[0].length !== height) {
            return false;
        }
        return true;
    }

    /**
     * @returns {BoardReturn['component']}
     */
    const getBoard = useMemo(() => {
        if (!validateBoard(chessBoard.board, dimension.width, dimension.height) || !pieceLayout.grid) {
            /** @type {BoardReturn['component']} */
            const nulledBoard = null;
            return nulledBoard;
        }

        const { component, value } = drawBoard(chessBoard, pieceLayout);
        setChessBoard({ board: value });

        if (!gameStarted) {
            setGameStarted(true);
        }

        return component;
    }, [boardSignature]);

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

    return (
        <>
            {/* Draw the board */}
            <div style={{ ...styles.chessBoard }}>{getBoard || <p>Loading the board</p>}</div>
        </>
    );
}

export default Chessboard;
