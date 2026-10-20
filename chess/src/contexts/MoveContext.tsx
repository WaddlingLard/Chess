import { useState, createContext, useContext, useRef, useCallback } from 'react';
import { useSelect } from './SelectContext';
import { ChessMove, MoveType } from '../types/types';

const MoveContext = createContext<{ 
    chessMoves: { moveList: Array<ChessMove> }, 
    addChessMove: ( newMove: Pick<ChessMove, 'newX' | 'newY' | 'type'>) => void, 
    moveCount: React.RefObject<number>,
    // createChessMove: ( newMove: Pick<ChessMove, 'newX' | 'newY' | 'type'>) => ChessMove | undefined
} | null>(null);

export function MoveProvider({children}: {children: React.ReactNode}) {

    const { selectedPiece, setSelectedPiece } = useSelect();
    const [chessMoves, setChessMoves] = useState<{ moveList: Array<ChessMove> }>({ moveList: [] });
    const moveCount = useRef<number>(0); 

    const addChessMove = useCallback((newMove: Pick<ChessMove, 'newX' | 'newY' | 'type'> ) => {
        if (selectedPiece === null) {
            // Need to add proper error handling for this instance
            console.error("Cannot add chess move with no selection!");
            return;
        }
        console.log('Added a new chess move: ', { ...selectedPiece, ...newMove });
        moveCount.current++;
        setChessMoves(({ moveList: [...chessMoves.moveList, { ...selectedPiece, ...newMove}]}));
        setSelectedPiece(null);
    }, [chessMoves, selectedPiece]);

    // const createChessMove = useCallback((newMove: Pick<ChessMove, 'newX' | 'newY' | 'type'>) => {
    //     if (selectedPiece === null) {
    //         // Need to add proper error handling for this instance
    //         console.error("Cannot add chess move with no selection!");
    //         return;
    //     }
    //     return { ...selectedPiece, ...newMove };
    // }, [selectedPiece]);

    const contextData = {
        chessMoves,
        addChessMove,
        moveCount,
        // createChessMove,
    };

    return (
        <MoveContext.Provider value={contextData}>
            {children}
        </MoveContext.Provider>
    )

}

export function useMoves() {
    const context = useContext(MoveContext);

    if (!context) {
        throw new Error("Accessing move context inside of tree without provider!");
    }
    return context;
}