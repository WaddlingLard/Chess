import React, { useState, useEffect, useRef } from "react";
import Chessboard, { DEFAULT_PIECE_LAYOUT } from "./Chessboard";
import PieceSelector, { pieceToggler } from "./PieceSelector";

function SplashScreen({ setGameStarter, boardDimension, pieceSetup }) {
    const titleCSS = Object.freeze({ margin: "1rem" });

    const [showPieceWindow, toggleWindow, clearWindow] = pieceToggler();
    const [tempPieceLayout, setTempPieceLayout] = useState({ grid: [] });

    // Initialize the temporary piece layout with default
    useEffect(() => {
        const useDefaultLayout = pieceSetup === undefined;
        const newPieceGrid = useDefaultLayout
            ? DEFAULT_PIECE_LAYOUT
            : pieceSetup;

        // console.log("New Piece Grid:", newPieceGrid);

        setTempPieceLayout((prev) => ({
            ...prev,
            grid: newPieceGrid,
        }));
    }, []);

    useEffect(() => {
        console.log("TempPieceLayout: ", tempPieceLayout);
    }, [tempPieceLayout]);

    const buttonHandler = () => {
        // Form checking

        // Start the game!
        setGameStarter(true);
    };

    const handlePieceWindow = () => {
        toggleWindow();

        // Create the new empty grid
        const emptyPieceGrid = Array(4)
            .fill(null)
            .map(() => {
                return [];
            });

        setTempPieceLayout((prev) => ({
            ...prev,
            grid: emptyPieceGrid,
        }));
    };

    // Guard to finish updating state
    if (tempPieceLayout.grid.length === 0) {
        return null;
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    // 3 Column system for (unsure, welcome message, piece setup)
                    gridTemplateColumns: "repeat(3, 1fr)",
                    fontSize: "2rem",
                    textAlign: "center",
                }}
            >
                {/* Welcome Message */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gridColumn: 2,
                        // justifyContent: "center",
                    }}
                >
                    <h1 style={{ ...titleCSS }}> Welcome to... </h1>
                    <h2 style={{ ...titleCSS }}> CHESS! </h2>

                    <button
                        style={{
                            width: "fit-content",
                            padding: ".5em",
                            alignSelf: "center",
                        }}
                        onClick={() => {
                            buttonHandler();
                        }}
                    >
                        Start the game!
                    </button>
                </div>

                {/* Piece Setup */}
                <div
                    style={{
                        fontSize: ".5em",
                        gridColumn: 3,
                        // position: "",
                    }}
                >
                    <h2>Piece Layout</h2>
                    <p>Setup your board. Choose your pieces!</p>

                    {/* Example Board */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            // position: "relative",
                            // justifyContent: "center",
                            alignItems: "center",
                            margin: "auto",
                            width: "fit-content",
                            height: "fit-content",
                        }}
                    >
                        <p
                            style={{
                                display: "inline-block",
                                backgroundColor: "#333",
                                width: "fit-content",
                                margin: 0,
                            }}
                        >
                            Example Board
                        </p>
                        <div
                            style={{
                                position: "relative",
                                width: "inherit",
                                height: "inherit",
                            }}
                        >
                            {showPieceWindow && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        width: "100%",
                                        height: "50%",
                                        // inset: "50% 0%",
                                        opacity: 0.8,
                                        borderRadius: "24px 24px 0px 0px",
                                        border: "2px black dotted",
                                        backgroundColor: "#333",
                                        boxSizing: "border-box",
                                    }}
                                ></div>
                            )}
                            <Chessboard
                                // ref={chessBoardRef}
                                renderScale={0.5}
                                chessPieceLayout={tempPieceLayout.grid}
                            />
                        </div>
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-around",
                                flex: 1,
                            }}
                        >
                            <button
                                onClick={() => {
                                    clearWindow();
                                    setTempPieceLayout((prev) => ({
                                        ...prev,
                                        grid: DEFAULT_PIECE_LAYOUT,
                                    }));
                                }}
                            >
                                Default
                            </button>
                            <button
                                onClick={() => {
                                    handlePieceWindow();
                                }}
                            >
                                Customize!
                            </button>
                        </div>

                        {showPieceWindow && (
                            <div style={{ fontSize: "1em" }}>
                                <PieceSelector />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default SplashScreen;
