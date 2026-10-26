import React, { useState, useEffect, createContext, useRef, useMemo } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import ChessPiece, { applyConditions, getMoveSystem, PIECE_MOVE_SYSTEM, PIECE_TYPE } from "./ChessPiece";
import { GAME_STATUS, useGame } from "../contexts/GameContext";
import { useSelect } from "../contexts/SelectContext";
import { useMoves } from "../contexts/MoveContext";
import { TeamTimer } from "./TeamTimer";
import { getNewChessBoard } from "../utils/boardCreationLogic";

// Importing types
/**@typedef {import('../types/types').PieceInformation} PieceInformation*/
/**@typedef {import('../types/types').MoveSystem} MoveSystem */
/**@typedef {import('../types/types').TileConditionData} TileConditionData */
/**@typedef {import('../types/types').PieceContext} PieceContext */
/**@typedef {import('../types/types').ChessMove} ChessMove */
/**@typedef {import('../types/types').Point} Point */
/**@typedef {import('../types/types').TeamType} TeamType */
/**@typedef {import('../types/types').ChessPieceType} ChessPieceType */
/**@typedef {import('../types/types').ControlMapNames} ControlMapNames */
// export const TileContext = createContext(undefined);

/**@typedef {import('../types/types').TileData} TileData*/

export const DEFAULT_BOARD_DIMENSION = 8;
export const DEFAULT_TILE_SIZE = 60

// The typical layout for a chessboard
export const DEFAULT_PIECE_LAYOUT = [
    [
        PIECE_TYPE.BLANK,
        PIECE_TYPE.BLANK,
        PIECE_TYPE.BLANK,
        PIECE_TYPE.BLANK,
        PIECE_TYPE.BLANK,
        PIECE_TYPE.BLANK,
        PIECE_TYPE.BLANK,
        PIECE_TYPE.BLANK,
    ],
    [],
    // [],
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

const DEFAULT_TIMER_DURATION = 10;

function Chessboard({
    boardWidth,
    boardHeight,
    // renderScale,
    chessPieceLayout,
    template = { tempPieceLayout: getEmptyPieceGrid(DEFAULT_BOARD_DIMENSION), setTempPieceLayout: null },
}) {
    
    // const { tempPieceLayout, setTempPieceLayout } = template;
    // const { boardState, setBoardState } = useGame();
    const { chessMoves } = useMoves();
    const { selectedPiece, setSelectedPiece } = useSelect();
    const { gameStatus, setGameStatus, teamTurn, teamOrder } = useGame();

    const [dimension, setDimension] = useState({
        width: undefined,
        height: undefined
    });
    
    // Make sure to wrap items in () if you need to cast to the type
    const [chessBoard, setChessBoard] = useState(/**@type {{ board: TileData[][] }}*/({ board: [] }));   
    const [boardSignature, setBoardSignature] = useState(null);
    const [pieceLayout, setPieceLayout] = useState({ grid: [] });

    const [verificationMode, setVerificationMode] = useState(true);

    // Store the pieces into the object/hashtable
    // const [pieceTable, setPieceTable] = useState({ table: {} });

    /**@type {React.Ref<Map<string, PieceInformation>} */
    // /**@type {React.Ref<Record<string, PieceInformation>} */
    const pieceTable = useRef(new Map());

    /**@type {React.Ref<Array<ChessMove>>} */
    const processedMoves = useRef([]);

    const [gameStarted, setGameStarted] = useState(false);

    // Store the selected tiles after each board generation
    // /**@typedef {{ x: number | null, y: number | null }} Point */
    // /**@type <React.RefObject<Point> */
    // const selectedTile = useRef({ x: null, y: null });

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
        const newGameGrid = getNewChessBoard(
            grid, 
            dimension.width, 
            dimension.height, 
            pieceTable.current,
            [createChessPiece, getChessBoardControlMaps]
        );

        // Does the game grid match with the piece layout dimension?
        if (newGameGrid.grid.length / 2 !== grid.length) {
            setErrorMessage(
                `Provided piece layout does not match up with the dimensions of the chess board ${
                    newGameGrid.length / 2
                } !== ${grid.length}`
            );
            setErrorFlag(true);
        }

        setChessBoard({ board: newGameGrid.grid });
        // setGameStatus('IN_PROGRESS');
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
     * Clears the gameBoard of any tile condition property set true
     * @param {TileData[][]} gameBoard
     * @return {TileData[][]} 
     */
    const clearSelection = (gameBoard) => {
        const currentBoard = [...gameBoard];

        for (let rowIdx = 0; rowIdx < currentBoard.length; rowIdx++) {
            for (let colIdx = 0; colIdx < currentBoard[0].length; colIdx++) {
                currentBoard[rowIdx][colIdx].tile.selected = false;
            }
        }

        return currentBoard;
    }

    /**
     * Clears the gameBoard of any validPaths set true 
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
     * Checks and see if any moves have been tampered with
     * @param {ChessMove[]} moves 
     * @param {ChessMove[]} alreadyProcessed
     * @return {boolean} 
     */
    const validateMoves = (moves, alreadyProcessed) => {

        const processedMoves = [...alreadyProcessed];

        // Consider move validation logic 
        let verifiedMoves = 0;
        for (const [index, move] of moves.entries()) {

            if (index >= processedMoves.length) {
                break;
            }

            const movesAreEqual = JSON.stringify(move) === JSON.stringify(processedMoves[index]);

            if (movesAreEqual) {
                verifiedMoves += 1;
            }

        }
        if (verifiedMoves !== processedMoves.length) {
            return false;
        }
        
        return true;
    }

    /**
     * Gets the new chess moves that haven't been processed and saves the new moves into the processedMoves reference
     * @param {ChessMove[]} moves 
     * @param {ChessMove[]} alreadyProcessed
     * @param {boolean} verifyMoves
     * @return {ChessMove[]} 
     */
    const getNewMoves = (moves, alreadyProcessed, verifyMoves) => {
        /**@type {ChessMove[]} */
        const newMoves = [];
        const moveDifference = moves.length - alreadyProcessed.length;

        if (verifyMoves) {
            const validationResult = validateMoves(moves, alreadyProcessed);
            if (!validationResult) {
                 throw new Error("Moves have been tampered with!");
            }
        }
        
        newMoves.push(...moves.slice(moves.length - moveDifference));
        return newMoves;

    }

    /**
     * Get the component the properly reflects the board state
     * @param {Array<Array<Object>>} gameGrid
     * @param {PieceContext | null} selectedPiece 
     * @param {ChessMove[]} chessMoves
     * @returns {BoardReturn}
     */
    const drawBoard = (gameGrid, selectedPiece, chessMoves) => {
        
        // console.log('drawing boad!')
        const { board } = gameGrid;
        let currentBoard = [...board];
        
        currentBoard = clearSelection(currentBoard);

        // Move handling logic
        if (chessMoves.length > 0) {
            /**@type {ChessMove[]} */
            const moves = getNewMoves(chessMoves, processedMoves.current, verificationMode);

            // Implement enactMoves
            currentBoard = enactMoves(currentBoard, moves, pieceTable.current, processedMoves);
            currentBoard = clearPath(currentBoard);
        }
        
        if (selectedPiece === null) {
            // Nothing...
            currentBoard = clearSelection(currentBoard);
            currentBoard = clearPath(currentBoard);
        } else if (selectedPiece.x !== null && selectedPiece.y !== null) {
            // Clear previous selected tile
            // selectedTile.current = newSelected;
            currentBoard[selectedPiece.y][selectedPiece.x].tile.selected = true;
            const validMoveTiles = generateValidMoves(selectedPiece, pieceTable.current, currentBoard);
            const captureMoveTiles = generateValidCaptures(selectedPiece, pieceTable.current);

            // Clear the current tile path
            currentBoard = clearPath(currentBoard);
            validMoveTiles.concat(captureMoveTiles).forEach((currentPoint) => {
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

        // console.log(selectedTile);
        const { component, value } = drawBoard(chessBoard, selectedPiece, chessMoves.moveList);
        setChessBoard({ board: value });

        // if (!gameStarted) {
        //     setGameStarted(true);
        // }

        return component;
    }, [boardSignature, selectedPiece, chessMoves]);

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
            position: 'relative',
            // width: `${tileRenderSize * dimension.width}px`,
            // height: `${tileRenderSize * dimension.height}px`,
            width: `${DEFAULT_TILE_SIZE * dimension.width}px`,
            height: `${DEFAULT_TILE_SIZE * dimension.height}px`,
            // display: 'flex',
            // display: "grid",
            // gridTemplateRows: `repeat(${dimension.height}, 1fr)`,
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
            <div
                style={{ display: 'flex', padding: '3rem'}}
            >
                <div style={{ ...styles.chessBoard }}>
                    {getBoard || <p>Loading the board</p>}
                </div>
                <div
                    style={{ width: 'fit-content', display: 'flex', alignItems: 'center', padding: '1rem' }}
                >
                    <div
                        style={{ 
                            // display: 'flex',
                            height: 'stretch',
                            display: 'flex',
                            flexDirection: 'column',
                            textAlign: 'center',  
                            alignContent: 'space-between',
                            justifyContent: 'space-between'
                        }}
                    >                        
                        {/* <p>{teamTurn}'s Turn</p> */}
                        {teamOrder.map((teamName) => (
                            <div style={{ minWidth: '14rem' }}>
                                <TeamTimer teamType={teamName} seconds={DEFAULT_TIMER_DURATION}/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Chessboard;
