import { createContext, useContext, useState } from "react";
import { DEFAULT_PIECE_LAYOUT } from "../components/Chessboard";

// The board context is what stores the piece setup/board layout
const BoardContext = createContext();

export function BoardProvider({children}) {

    const [globalPieceLayout, setGlobalPieceLayout] = useState(DEFAULT_PIECE_LAYOUT);
    const [tempPieceLayout, setTempPieceLayout] = useState(null);

    const contextData = {
        globalPieceLayout,
        setGlobalPieceLayout,
        tempPieceLayout,
        setTempPieceLayout
    };

    return (
        <BoardContext.Provider value={contextData}>
            {children}
        </BoardContext.Provider>
    );

}

export function useBoard() {
    const context = useContext(BoardContext);

    if (!context) {
        throw new Error("Cannot access context outside of provider!");
    }

    return context;
}