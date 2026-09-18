import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';

export const GAME_STATUS = Object.freeze({
    WAITING: "WAITING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED"
});

// The game context is an important context that can be used to keep track of the entire game state
// Not only should it store the pieces, but it should also store tile information
const GameContext = createContext();

export function GameProvider({children}) {
    
    const [boardState, setBoardState] = useState(null);
    const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);
    const [gameSignature, setGameSignature] = useState(null);
    const selectedTile = useRef([]);

    useEffect(() => {
        if (!boardState) { return; }

        // Cannot get selected tiles because board refresh in Chessboard is causing to use initial constructor data to
        // make a new table that overwrites the selectionHandler, need to make board construction process cognizant of
        // previous gameState data
        console.log(`Board State:`, boardState);

        const selectedTiles = boardState.map((row, rIdx) =>  
            row.filter((tileData, idx) => tileData.tile.selected )
        ).flat();

        console.log(`Selected Tiles:`, selectedTiles);
        setGameSignature(JSON.stringify(boardState));
    }, [boardState]);

    useEffect(() => {
        console.log("Game status is now:", gameStatus);
    }, [gameStatus])
    
    // const contextData = useMemo(() => ({
    //     boardState,
    //     setBoardState,
    //     gameStatus,
    //     setGameStatus
    // }), [gameSignature]);

    const contextData = {
        gameStatus,
        setGameStatus
    };

    return (
        <GameContext.Provider value={contextData}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const context = useContext(GameContext);
    
    if (!context) {
        throw new Error("Cannot access context outside of provider!");
    }

    return context;
}