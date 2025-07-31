import React, { useState, useEffect, useCallback } from "react";
import ChessPiece, { PIECE_TYPE } from "./ChessPiece";

// Importing icon libraries
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faChessPawn,
    faChessKnight,
    faChessBishop,
    faChessRook,
    faChessQueen,
    faChessKing,
} from "@fortawesome/free-solid-svg-icons";

// Custom hook used to toggle the piece selector window
export function pieceToggler(initial = false) {
    const [value, setValue] = useState(initial);

    const toggle = useCallback(() => {
        setValue((prev) => !prev);
        console.log("Toggled!");
    }, []);

    const clear = useCallback(() => {
        setValue((prev) => false);
        console.log("Cleared!");
    }, []);

    return [value, toggle, clear];
}

function PieceSelector() {
    const DEFAULT_CHESS_PIECE_LINEUP = [
        PIECE_TYPE.PAWN,
        PIECE_TYPE.KNIGHT,
        PIECE_TYPE.BISHOP,
        PIECE_TYPE.ROOK,
        PIECE_TYPE.QUEEN,
        PIECE_TYPE.KING,
    ];

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    height: "2em",
                }}
            >
                {DEFAULT_CHESS_PIECE_LINEUP.map((element, index) => (
                    <div key={index}>
                        <ChessPiece name={element.name} />
                    </div>
                ))}
            </div>
        </>
    );
}

export default PieceSelector;
