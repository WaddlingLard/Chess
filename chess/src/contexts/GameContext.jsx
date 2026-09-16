import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

// The game context is an important context that can be used to keep track of the entire game state
// Not only should it store the pieces, but it should also store tile information
const GameContext = createContext();

export function GameProvider({children}) {
    
    const [boardState, setBoardState] = useState(null);
    const [gameSignature, setGameSignature] = useState(null);

    useEffect(() => {
        if (!boardState) { return; }
        setGameSignature(JSON.stringify(boardState));
    }, [boardState])
    
    const contextData = useMemo(() => ({
        boardState,
        setBoardState
    }), [gameSignature]);

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