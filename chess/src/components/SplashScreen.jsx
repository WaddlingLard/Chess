import React, { useState, useEffect, useRef } from "react";
import Chessboard, { DEFAULT_PIECE_LAYOUT, DEFAULT_BOARD_DIMENSION, getEmptyPieceGrid } from "./Chessboard";
import PieceSelector, { pieceToggler } from "./PieceSelector";
import "../css/splashscreen.css";

function SplashScreen({ setGameStarter, boardDimension, pieceSetup }) {
    const [showPieceWindow, toggleWindow, clearWindow] = pieceToggler();
    const [tempPieceLayout, setTempPieceLayout] = useState({ grid: [] });

    // Initialize the temporary piece layout with default
    useEffect(() => {
        const useDefaultLayout = pieceSetup === undefined;
        const newPieceGrid = useDefaultLayout ? DEFAULT_PIECE_LAYOUT : pieceSetup;

        // useDefaultLayout ? null : console.log("New Piece Grid:", newPieceGrid);

        setTempPieceLayout((prev) => ({
            ...prev,
            grid: newPieceGrid,
        }));
    }, []);

    useEffect(() => {
        // console.log("TempPieceLayout: ", tempPieceLayout);
    }, [tempPieceLayout]);

    const buttonHandler = () => {
        // Form checking

        // Start the game!
        setGameStarter(true);
    };

    const handlePieceWindow = () => {
        toggleWindow();
        setTempPieceLayout((prev) => ({
            ...prev,
            grid: getEmptyPieceGrid(DEFAULT_BOARD_DIMENSION),
        }));
    };

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
                            buttonHandler();
                        }}
                    >
                        Start the game!
                    </button>
                </div>

                {/* Piece Setup */}
                <div id="piece-setup-container">
                    <h2>Piece Layout</h2>
                    <p>Setup your board. Choose your pieces!</p>

                    {/* Example Board */}
                    <div id="example-board-container">
                        <p id="board-subtitle-text">Example Board</p>
                        <div
                            style={{
                                position: "relative",
                                width: "inherit",
                                height: "inherit",
                            }}
                        >
                            {showPieceWindow && <div id="board-half-cover"></div>}
                            {!showPieceWindow && <div id="board-full-cover"></div>}

                            <Chessboard
                                // ref={chessBoardRef}
                                renderScale={0.5}
                                chessPieceLayout={tempPieceLayout.grid}
                            />
                        </div>
                        <div id="chess-layout-button-container">
                            <button
                                onClick={() => {
                                    showPieceWindow ? clearWindow() : null;
                                    setTempPieceLayout((prev) => ({
                                        ...prev,
                                        grid: DEFAULT_PIECE_LAYOUT,
                                    }));
                                }}
                            >
                                Load Default
                            </button>
                            <button
                                onClick={() => {
                                    handlePieceWindow();
                                }}
                                disabled={showPieceWindow}
                            >
                                Customize!
                            </button>
                        </div>

                        {showPieceWindow && (
                            <>
                                <div style={{ fontSize: "1em" }}>
                                    <PieceSelector />
                                </div>
                                <button
                                    onClick={() => {
                                        confirmPieceLayout();
                                    }}
                                >
                                    Confirm
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default SplashScreen;
