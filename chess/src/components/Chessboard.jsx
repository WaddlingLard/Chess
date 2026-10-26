import React, { useState, useEffect, createContext, useRef, useMemo } from "react";
import "../css/chessboard.css";
import ChessTile from "./ChessTile";
import { PIECE_TYPE } from "./ChessPiece";
import { useGame } from "../contexts/GameContext";
import { useSelect } from "../contexts/SelectContext";
import { useMoves } from "../contexts/MoveContext";
import { TeamTimer } from "./TeamTimer";
import { 
    validateCheck, 
    enactMoves, 
    getCheckablePieces, 
    generateValidMoves, 
    generateValidCaptures,
    calculateTileInfluence
} from "../utils/tileUpdatingLogic";
import { mergeMaps } from "../utils/utils";
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
let newPieceID = 0;

const getNewPieceId = () => { return newPieceID++ }; 

/**
 * @param {Pick<PieceInformation, "name" | "icon">} pieceType 
 * @param {ChessPieceType} teamName 
 * @returns {PieceInformation}
 */
export function createChessPiece(pieceType, teamName) {
    const mutableProperties = ['moveCount'];
    const chessPiece = { ...pieceType, ...{ team: teamName, moveCount: 0, id: getNewPieceId() }};
    for (const key in chessPiece) {
        Object.defineProperty(chessPiece, key, {
            writable: mutableProperties.includes(key)
        });
    }
    return chessPiece;
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
    const { chessMoves, createChessMove } = useMoves();
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

    // Uses a stringified Point to store PieceInformation on that tile
    const pieceTable = useRef(/**@type {Map<string, PieceInformation>} */(new Map()));

    // Stores the tiles of control that are controlled by certain pieces
    const tilesOfMovement = useRef(/**@type {Map<string, Set<PieceInformation>>} */(new Map()));
    const tilesOfCapture = useRef(/**@type {Map<string, Set<PieceInformation>>} */(new Map()));

    // Stores the piecesID and their influence on tiles (Point)
    const pieceMvmCtrl = useRef(/**@type {Map<number, Set<Point>>} */(new Map()));
    const pieceCptCtrl = useRef(/**@type {Map<number, Set<Point>>} */(new Map()));

    const checkedPieces = useRef(/**@type {Set<PieceInformation>} */(new Set()));
    const checkingPieces = useRef(/**@type {Set<PieceInformation>} */(new Set()));

    /**@type {React.RefObject<Array<ChessMove>>} */
    const processedMoves = useRef([]);

    // /**@type {React.RefObject<Number>} */
    // const newPieceID = useRef(0);

    const [gameStarted, setGameStarted] = useState(false);
    
    // Store the selected tiles after each board generation
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

    useEffect(() => {
        // This is where check logic is housed for now
        const checkables = getCheckablePieces(pieceTable.current);
        // console.log("Attempting check check...", checkables);
        
        const checkedTiles = validateCheck(checkables, tilesOfCapture.current, teamTurn);
        if (checkedTiles.length > 0) {
            console.log("Check!");
            setGameStatus('CHECK');
            const updatedBoard = [...chessBoard.board];
            for (const { x, y } of checkedTiles) {
                
                updatedBoard[y][x].tile.checked = true;
            }
            setChessBoard({ board: updatedBoard });
            return;
        } else if (gameStatus === 'CHECK') {
            setChessBoard({ board: clearTileConditionProperty(chessBoard.board, 'checked')});
            setGameStatus('IN_PROGRESS');
        } 
            
    }, [boardSignature, gameStatus, teamTurn]);

    // useEffect(() => {
    //     if (gameStarted) {
    //         setGameStatus(GAME_STATUS.IN_PROGRESS);
    //     }
    // }, [gameStarted]);

    /**
     * Clears the gameBoard of any tile condition property set true
     * @param {TileData[][]} gameBoard
     * @param {keyof TileConditionData} property
     * @return {TileData[][]} 
     */
    const clearTileConditionProperty = (gameBoard, property) => {
        const currentBoard = [...gameBoard];

        for (let rowIdx = 0; rowIdx < currentBoard.length; rowIdx++) {
            for (let colIdx = 0; colIdx < currentBoard[0].length; colIdx++) {
                currentBoard[rowIdx][colIdx].tile[property] = false;
            }
        }

        return currentBoard;
    }

    /**
     * Flags the tile property on a gameboard with provided tiles 
     * @param {TileData[][]} gameBoard 
     * @param {Point[]} tiles 
     * @param {keyof TileConditionData} property
     * @return {TileData[][]} 
     */
    const flagTileConditionProperty = (gameBoard, tiles, property) => {
        const currentBoard = [...gameBoard];
    
        tiles.forEach((point) => {
            currentBoard[point.y][point.x].tile[property] = true;
        });

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
     * @param {TileData[][]} gameGrid
     * @param {PieceContext | null} selectedPiece 
     * @param {ChessMove[]} chessMoves
     * @returns {JSX.Element}
     */
    const drawBoard = (gameGrid) => {

        const component = (
            <>
                {gameGrid.map((gridRow, rIdx) => {
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
        
        // Necessary for tile updates (NOT TRUE ANYMORE)
        // const updatedGrid = currentBoard;
        // console.log(updatedGrid);

        return component;
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
     * Handles any new chess moves by mutating the board to reflect the new moves
     * @param {TileData[][]} chessBoard
     * @returns {TileData[][]}
     */
    const handleChessMoves = (chessBoard) => {

        let currentBoard = [...chessBoard];

        if (chessMoves.moveList.length !== processedMoves.current.length) {
            /**@type {ChessMove[]} */
            const moves = getNewMoves(chessMoves.moveList, processedMoves.current, verificationMode);
    
            currentBoard = enactMoves(
                currentBoard, 
                moves, 
                pieceTable.current, 
                processedMoves,
                getChessBoardControlMaps()
            );
            currentBoard = clearTileConditionProperty(currentBoard, 'validPath');
        }

        return currentBoard;
    }

    /**
     * Gets all of the control maps and returns them in an Object
     * @returns {Record<ControlMapNames, Map<any, Set<any>>>}
     */
    const getChessBoardControlMaps = () => {

        /**@type {Record<ControlMapNames, Map<any, Set<any>>>} */
        const controlMaps = { 
            'tilesOfMovement': tilesOfMovement.current,
            'tilesOfCapture': tilesOfCapture.current,
            'pieceMvmCtrl': pieceMvmCtrl.current,
            'pieceCptCtrl': pieceCptCtrl.current
        };

        return controlMaps;

    }

    /**
     * Handles a piece selection
     * @param {TileData[][]} chessBoard 
     * @returns {TileData[][]}
     */
    const handlePieceSelection = (chessBoard) => {
        
        let currentBoard = [...chessBoard];
        
        const pieceHandler = new Worker()

        currentBoard = clearTileConditionProperty(currentBoard, 'selected');
        currentBoard = clearTileConditionProperty(currentBoard, 'validPath');
        
        if (selectedPiece && selectedPiece.x !== null && selectedPiece.y !== null) {
            // Clear previous selected tile
            // selectedTile.current = newSelected;
            currentBoard[selectedPiece.y][selectedPiece.x].tile.selected = true;
            const validMoveTiles = generateValidMoves(selectedPiece, pieceTable.current, currentBoard, getChessBoardControlMaps(), false, false);
            const captureMoveTiles = generateValidCaptures(selectedPiece, pieceTable.current, currentBoard, getChessBoardControlMaps());

            // Clear the current tile path
            currentBoard = clearTileConditionProperty(currentBoard, 'validPath');
            currentBoard = flagTileConditionProperty(currentBoard, validMoveTiles.concat(captureMoveTiles), 'validPath');
        }

        return currentBoard;
    }

    /**
     * @returns {JSX.Element}
     */
    const getBoard = useMemo(() => {
        console.log("board signature changed!");
        if (!validateBoard(chessBoard.board, dimension.width, dimension.height)) {
            /** @type {BoardReturn['component']} */
            const nulledBoard = null;
            return nulledBoard;
        }

        let currentBoard = [...chessBoard.board];

        currentBoard = handleChessMoves(currentBoard);
        currentBoard = handlePieceSelection(currentBoard);

        // console.log(selectedTile);
        const component = drawBoard(currentBoard);
        setChessBoard({ board: currentBoard });

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
