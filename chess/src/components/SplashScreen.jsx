import React, { useState, useEffect, useRef, useContext } from "react";
import Chessboard, { DEFAULT_PIECE_LAYOUT, DEFAULT_BOARD_DIMENSION, getEmptyPieceGrid } from "./Chessboard";
import PieceSelector, { pieceToggler } from "./PieceSelector";
import "../css/splashscreen.css";
import { BoardContext } from "../ChessApp";

function SplashScreen({ setGameStarter, boardDimension, pieceSetup }) {

    const [showPieceWindow, toggleWindow, clearWindow] = pieceToggler();
    const [tempPieceLayout, setTempPieceLayout] = useState({
        grid: getEmptyPieceGrid(DEFAULT_BOARD_DIMENSION),
    });

    const parentBoardContext = useContext(BoardContext);
    const { globalPieceLayout, setGlobalPieceLayout } = parentBoardContext;

    // Initialize the temporary piece layout with default
    useEffect(() => {
        const useDefaultLayout = pieceSetup === undefined;
        const newPieceGrid = useDefaultLayout ? DEFAULT_PIECE_LAYOUT : pieceSetup;

        // useDefaultLayout ? null : console.log("New Piece Grid:", newPieceGrid);

        setGlobalPieceLayout((prev) => ({
            ...prev,
            grid: newPieceGrid,
        }));
    }, []);

    // useEffect(() => {
    //     console.log("TempPieceLayout: ", tempPieceLayout);
    // }, [tempPieceLayout]);

    // const buttonHandler = () => {

    //     // Start the game!
    //     setGameStarter(true);
    // };

    // NOTE: Used for the piece layout module
    // const handlePieceWindow = (loadEmptyGrid = false) => {
    //     if (!loadEmptyGrid) {
    //         toggleWindow();
    //     }

    //     setTempPieceLayout((prev) => ({
    //         grid: getEmptyPieceGrid(DEFAULT_BOARD_DIMENSION),
    //     }));
    //     setGlobalPieceLayout((prev) => ({
    //         ...prev,
    //         grid: loadEmptyGrid ? DEFAULT_PIECE_LAYOUT : getEmptyPieceGrid(DEFAULT_BOARD_DIMENSION),
    //     }));
    // };

    // const confirmPieceLayout = () => {
    //     // toggleWindow();
    //     clearWindow();
    //     setGlobalPieceLayout((prev) => ({
    //         ...prev,
    //         grid: tempPieceLayout.grid,
    //     }));
    // };

    // Guard to finish updating state
    if (tempPieceLayout.grid.length === 0) {
        return null;
    }

    return (
        <>
            <div id="main-container">
                {/* Welcome Message */}
                <div id="welcome-container">
                    <h1> Welcome to... </h1>
                    <h2> CHESS! </h2>

                    <button
                        id="start-button"
                        onClick={() => {
                            setGameStarter(true);
                        }}
                    >
                        Start the game!
                    </button>
                </div>

                {/* Piece Setup */}
                <div id="piece-setup-container">
                    
                </div>
            </div>
        </>
    );
}

export default SplashScreen;
