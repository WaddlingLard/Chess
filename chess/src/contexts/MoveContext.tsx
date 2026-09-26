import { useState, createContext, useContext, useCallback } from 'react';
import { useSelect, PieceContext } from './SelectContext';

export type ChessMove = PieceContext & { newX: number, newY: number, type: MoveType };
export type MoveType = "CHECK" | "MOVE" | "CAPTURE";

const MoveContext = createContext<{ chessMoves: { moveList: Array<ChessMove> }, addChessMove: ( newMove: Pick<ChessMove, 'newX' | 'newY' | 'type'>) => void } | null>(null);

export function MoveProvider({children}: {children: React.ReactNode}) {

    const { selectedPiece, setSelectedPiece } = useSelect();
    const [chessMoves, setChessMoves] = useState<{ moveList: Array<ChessMove> }>({ moveList: [] });
    
    const addChessMove = useCallback((newMove: Pick<ChessMove, 'newX' | 'newY' | 'type'> ) => {
        if (selectedPiece === null) {
            // Need to add proper error handling for this instance
            console.error("Cannot add chess move with no selection!");
            return;
        }
        console.log('Added a new chess move: ', { ...selectedPiece, ...newMove });
        setChessMoves(({ moveList: [...chessMoves.moveList, { ...selectedPiece, ...newMove}]}));
        setSelectedPiece(null);
    }, [chessMoves, selectedPiece]);

    const contextData = {
        chessMoves,
        addChessMove
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