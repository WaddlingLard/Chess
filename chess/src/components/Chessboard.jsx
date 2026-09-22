import React, { useState, useEffect, createContext, useRef, useMemo } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import ChessPiece, { PIECE_MOVE_SYSTEM, PIECE_TYPE } from "./ChessPiece";
import { GAME_STATUS, useGame } from "../contexts/GameContext";
import { useSelect } from "../contexts/SelectContext";

// Importing types
/**@typedef {import('./ChessPiece').PieceInformation} PieceInformation*/
/**@typedef {import('./ChessTile').TileConditionData} TileConditionData */
/**@typedef {import('./ChessPiece').MoveSystem} MoveSystem */
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

    // Store the selected tiles after each board generation
    /**@type <React.RefObject<Record["x" | "y", number | null]> */
    const selectedTile = useRef({ x: null, y: null });

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

        const { grid } = pieceLayout;
        const newGameGrid = buildGameGrid(grid, dimension.width, dimension.height);

        // Does the game grid match with the piece layout dimension?
        if (newGameGrid.length / 2 !== grid.length) {
            setErrorMessage(
                `Provided piece layout does not match up with the dimensions of the chess board ${
                    newGameGrid.length / 2
                } !== ${grid.length}`
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

    // useEffect(() => {
    //     if (gameStarted) {
    //         setGameStatus(GAME_STATUS.IN_PROGRESS);
    //     }
    // }, [gameStarted]);

    /**
     * Builds a grid and adds the piece/tile information
     * @param {number} width 
     * @param {number} height 
     * @returns {Array<Array<Record<"x" | "y", number>>}
     */
    const buildGameGrid = (chessPieceGrid, width, height) => {
    
        const isOtherTeam = (currentRow) => {
            return currentRow >= height / 2;
        };

        /**@type {Array<Array<Object>>} */
        const grid = [];

        // Iterate over the dimensions to make a base grid
        for (let rIdx = 0; rIdx < width; rIdx++) {

            const currentPieceRow = chessPieceGrid[isOtherTeam(rIdx) 
                ? rIdx % chessPieceGrid.length 
                : chessPieceGrid.length - 1 - (rIdx % chessPieceGrid.length)];
            const ignorePieceRow = !currentPieceRow.length

            grid.push([]);
            for (let cIdx = 0; cIdx < height; cIdx++) {
                const data = { x: cIdx, y: rIdx };
                data.tile = { selected: false };
                if (ignorePieceRow) {
                    data.piece = null;
                } else {
                    data.piece = { ...currentPieceRow[cIdx] };
                    data.piece.team = isOtherTeam(rIdx) ? "BLACK" : "WHITE"
                }
                grid[rIdx][cIdx] = data; 
            }
        }

        return grid;
    }

    /**
     * Generate the valid tiles that the selected tile/piece can click on to move too
     * @param {Point} selectedTile 
     * @param {Record<string, PieceInformation>} pieceLocations 
     * @param {TileData[][]} gameBoard 
     * @returns {Point[]}
     */
    const generateValidMoves = (selectedTile, pieceLocations, gameBoard) => {
        // Get the piece that belongs to the selectedTile
        
        /**@type {PieceInformation & {moveSystem: MoveSystem | undefined}} */
        let pieceInfo = {...pieceLocations[JSON.stringify(selectedTile)]};
        pieceInfo = Object.assign(pieceInfo, { moveSystem: {...PIECE_MOVE_SYSTEM[pieceInfo.name]}});
        /**@type {Point[]} */
        const validMovePath = [];
        // let { steps, limit, conditions } = PIECE_MOVE_SYSTEM[pieceInfo.name];
        const { conditions } = pieceInfo.moveSystem;

        if (conditions) {
            for (const key in pieceInfo.moveSystem) {
                // console.log(key);
                if (key in conditions) {
                    const bindContextCallable = pieceInfo.moveSystem.conditions[key].bind(pieceInfo); 
                    // console.log("calling", key);
                    pieceInfo.moveSystem[key] = bindContextCallable();
                }
            }   
        }

        // Grab after the conditions are applied
        const { steps, limit } = pieceInfo.moveSystem;

        console.log(steps, limit, conditions);

        let moveSteps = [...steps];
        const [currY, currX] = [selectedTile.y, selectedTile.x]; 
        for (let i = 0; i !== (limit === 0 ? -1 : limit) ; i++) {
            
            if (moveSteps.length === 0) {
                break;
            }

            for (const step of moveSteps) {
                /**@type {[number[], number[]]} */
                const [ySteps, xSteps] = step;
                const yDiff = ySteps.reduce((subtotal, currVal) => { return subtotal + currVal }) * (i + 1);
                const xDiff = xSteps.reduce((subtotal, currVal) => { return subtotal + currVal }) * (i + 1);
                /**@type {Point} */
                const newValidMove = { x: xDiff + currX, y: yDiff + currY };

                // console.log('new move: ', newValidMove, yDiff, xDiff, ySteps, xSteps);

                if (newValidMove.x >= gameBoard[0].length 
                    || newValidMove.x < 0
                    || newValidMove.y >= gameBoard.length
                    || newValidMove.y < 0
                ) {
                    // Out of bounds
                    moveSteps = moveSteps.filter((step, idx) => { return step[0] != ySteps && step[1] != xSteps });
                    continue;
                }
                
                // Need to account for capture logic if opposite team
                if (JSON.stringify(newValidMove) in pieceLocations) {
                    // Piece existing on tile
                    // NOTE: This is where capture logic occurs

                    moveSteps = moveSteps.filter((step, idx) => { return step[0] != ySteps && step[1] != xSteps });
                } else {
                    // Valid move
                    // gameBoard[newValidMove.y][newValidMove.x].tile.validPath = true;
                    validMovePath.push(newValidMove);
                } 
            }
        }

        console.log("Valid Moves: ", validMovePath);

        return validMovePath;

    }

    /**
     * @param {TileData[][]} gameBoard
     * @returns {TileData[][]}
     */
    const clearPath = (gameBoard) => {
        const currentBoard = [...gameBoard];

        for (let rowIdx = 0; rowIdx < currentBoard.length; rowIdx++) {
            for (let colIdx = 0; colIdx < currentBoard[0].length; colIdx++) {
                currentBoard[rowIdx][colIdx].tile.validPath = false;
            }
        }

        return currentBoard;
    }

    /**
     * @typedef {Object} BoardReturn
     * @property {Element | null} component
     * @property {Array<Array<Object>> | null} value
     */

    /**
     * Get the component the properly reflects the board state
     * @param {Array<Array<Object>>} gameGrid 
     * @returns {BoardReturn}
     */
    const drawBoard = (gameGrid) => {
        
        // console.log('drawing boad!')
        const { board } = gameGrid;
        const currentBoard = [...board];
        const newSelected = { x: null, y: null };
        const existingSelection = selectedTile.current.x !== null && selectedTile.current.y !== null;

        const matchSelection = ({x, y}) => {
            return x === selectedTile.current.x && y === selectedTile.current.y;
        }

        const selectedTiles = currentBoard.map((row, rIdx) => row.filter((tileData, index) => tileData.tile.selected)).flat();
        console.log(selectedTiles);
        for (const tile of selectedTiles) {
            const alreadySelected = matchSelection(tile);
            if (!alreadySelected) {
                newSelected.x = tile.x;
                newSelected.y = tile.y;
                existingSelection ? (currentBoard[selectedTile.current.y][selectedTile.current.x].tile.selected = false) : null;
            }
        }

        if (newSelected.x !== null && newSelected.y !== null) {
            // Clear previous selected tile
            // const [x, y] = /** @type {[number, number]} */ (selectedTiles.current);
            selectedTile.current = newSelected;
            const validMoveTiles = generateValidMoves(selectedTile.current, pieceTable.table, currentBoard);
            // Clear the current tile path
            currentBoard = clearPath(currentBoard);
            validMoveTiles.forEach((currentPoint) => {
                currentBoard[currentPoint.y][currentPoint.x].tile.validPath = true;
            });
        }

        const component = (
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
                        {gridRow.map((tileData, cIdx) => {
                            return (
                                <ChessTile
                                    key={`${rIdx}${cIdx}`}
                                    constructorData={tileData}
                                    updateBoard={{chessBoard, setChessBoard}}
                                    // templateGrid={{ tempPieceLayout, setTempPieceLayout }}
                                />
                            );
                        })}
                        </div>
                    )
                })}
            </>
        );
        
        // Necessary for tile updates
        const updatedGrid = currentBoard;
        console.log(updatedGrid);

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
        console.log("board signature changed!");
        if (!validateBoard(chessBoard.board, dimension.width, dimension.height)) {
            /** @type {BoardReturn['component']} */
            const nulledBoard = null;
            return nulledBoard;
        }

        console.log(selectedTile);
        const { component, value } = drawBoard(chessBoard);
        setChessBoard({ board: value });

        // if (!gameStarted) {
        //     setGameStarted(true);
        // }

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
