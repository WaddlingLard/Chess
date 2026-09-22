import React, { useState, createContext, useContext, SetStateAction, useEffect } from 'react';
import { PieceInformation } from '../components/ChessPiece';
import { Point } from '../types/types';

export type PieceContext = Point & { piece: PieceInformation };

const SelectContext = createContext<{ 
    selectedPiece: PieceContext | null, 
    setSelectedPiece: React.Dispatch<SetStateAction<PieceContext | null>>
    } | null>
    (null);

export function SelectProvider({children} : {children: React.ReactNode}) {

    const [selectedPiece, setSelectedPiece] = useState<PieceContext | null>(null);

    useEffect(() => {
        console.log("Selected piece is now: ", selectedPiece);
    }, [selectedPiece]);

    const contextData = {
        selectedPiece,
        setSelectedPiece
    };

    return (
        <SelectContext.Provider value={contextData}>
            {children}
        </SelectContext.Provider>
    )

}

export function useSelect() {
    const context = useContext(SelectContext);
    if (!context) throw new Error("Cannot use context as not wrapped in a provider!");
    return context;
}