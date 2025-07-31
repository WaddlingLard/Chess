import React, { useState, useEffect, useRef } from "react";
import Chessboard from "./Chessboard";
import { DEFAULT_PIECE_LAYOUT } from "./Chessboard";

function SplashScreen({ setGameStarter, boardDimension, pieceSetup }) {
    const titleCSS = Object.freeze({ margin: "1rem" });

    const buttonHandler = () => {
        // Form checking

        // Start the game!
        setGameStarter(true);
    };

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
                                width: "inherit",
                                height: "inherit",
                            }}
                        >
                            <Chessboard
                                // ref={chessBoardRef}
                                renderScale={0.5}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SplashScreen;
