import React, { createContext, useContext, useCallback, useState, useMemo, useEffect, useRef, SetStateAction } from 'react';
import { TeamType } from '../components/ChessPiece';
import { useMoves } from './MoveContext';

export const GAME_STATUS = Object.freeze({
    WAITING: "WAITING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED"
});

// The game context is an important context that can be used to keep track of the entire game state
// Not only should it store the pieces, but it should also store tile information
const GameContext = createContext<{
        gameStatus: keyof typeof GAME_STATUS | null,
        setGameStatus: React.Dispatch<SetStateAction<keyof typeof GAME_STATUS | null>>,
        teamTurn: TeamType | null,
        teamOrder: TeamType[],
    } | null>
    (null);

export function GameProvider({children}: {children: React.ReactNode}) {
    
    const { moveCount, chessMoves } = useMoves();

    const [boardState, setBoardState] = useState(null);
    const [gameStatus, setGameStatus] = useState<keyof typeof GAME_STATUS | null>(null);
    
    const [teamOrder, setTeamOrder] = useState<TeamType[]>(['WHITE', 'BLACK']);
    const [teamScore, setTeamScore] = useState<Record<TeamType, number>>({ 'WHITE': 0, 'BLACK': 0 });
    const [teamTurn, setTeamTurn] = useState<TeamType | null>(null);

    // const [gameSignature, setGameSignature] = useState<string | null>(null);
    // const selectedTile = useRef([]);

    const updateTurn = useCallback((count: number) => {
        setTeamTurn(teamOrder[count % teamOrder.length]);
    }, [teamOrder]);
    
    // useEffect(() => {
    //     console.log(teamTurn);
    // }, [teamTurn]);

    // useEffect(() => {
    //     if (!boardState) { return; }

    //     // Cannot get selected tiles because board refresh in Chessboard is causing to use initial constructor data to
    //     // make a new table that overwrites the selectionHandler, need to make board construction process cognizant of
    //     // previous gameState data
    //     // console.log(`Board State:`, boardState);

    //     // const selectedTiles = boardState.map((row, rIdx) =>  
    //     //     row.filter((tileData, idx) => tileData.tile.selected )
    //     // ).flat();

    //     // console.log(`Selected Tiles:`, selectedTiles);
    //     // setGameSignature(JSON.stringify(boardState));
    // }, [boardState]);

    // useEffect(() => {
    //     console.log("Game status is now:", gameStatus);
    // }, [gameStatus])
    
    useEffect(() => {
        if (moveCount.current === null) {
            return;
        }
        // Update the teamTurn
        updateTurn(moveCount.current);
    }, [chessMoves]);

    // const contextData = useMemo(() => ({
    //     boardState,
    //     setBoardState,
    //     gameStatus,
    //     setGameStatus
    // }), [gameSignature]);

    const contextData = {
        gameStatus,
        setGameStatus,
        teamTurn,
        teamOrder,
        // updateTurn,
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