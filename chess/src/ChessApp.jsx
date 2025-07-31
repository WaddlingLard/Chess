import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Chessboard, { DEFAULT_BOARD_DIMENSION } from "./components/Chessboard";
import SplashScreen from "./components/SplashScreen";

function ChessApp() {
    const [count, setCount] = useState(8);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const DEFAULT_PIECE_ITERATION = [];

    // Default dimensions for a chess board
    const [boardDimension, setBoardDimension] = useState(
        DEFAULT_BOARD_DIMENSION
    );

    return (
        <>
            <header>
                <title>Chess!</title>
            </header>

            {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}

            {!isGameStarted && (
                <div style={{ width: "100%", height: "100%" }}>
                    <SplashScreen
                        setGameStarter={setIsGameStarted}
                        boardDimension={boardDimension}
                        pieceSetup={boardDimension}
                    />
                </div>
            )}

            {isGameStarted && (
                <div
                    style={{
                        // zIndex: 1,
                        display: "flex",
                        // width: 'fit-content',
                        // height: 'fit-content',
                        // padding: '100px',
                        // minHeight: '400px',
                        // minWidth: '400px',

                        // margin: 'auto',
                        // margin: '5%',
                        padding: "4%",
                        backgroundColor: "#AF855C",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "visible",
                        fontSize: "2rem",
                    }}
                >
                    <Chessboard
                        width={boardDimension}
                        height={boardDimension}
                    />
                </div>
            )}
        </>
    );
}

export default ChessApp;
