import React, { useState, useEffect } from "react";

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

// prettier-ignore
export const PIECE_TYPE = Object.freeze({
    PAWN:   { name: "PAWN",   icon: faChessPawn },
    KNIGHT: { name: "KNIGHT", icon: faChessKnight },
    BISHOP: { name: "BISHOP", icon: faChessBishop  },
    ROOK:   { name: "ROOK",   icon: faChessRook },
    QUEEN:  { name: "QUEEN",  icon: faChessQueen },
    KING:   { name: "KING",   icon: faChessKing },
});

function ChessPiece({ name }) {
    const [pieceType, setPieceType] = useState(undefined);

    // Set the piece type
    useEffect(() => {
        if (PIECE_TYPE[name] == undefined) {
            throw new Error(
                "Invalid piece type provided to chess piece constructor!"
            );
        }

        setPieceType(PIECE_TYPE[name]);
    }, []);

    return (
        <>
            <div
                style={{ display: "flex", width: "100%", height: "100%" }}
                draggable={true}
            >
                {pieceType !== undefined && (
                    <FontAwesomeIcon
                        style={{
                            width: "inherit",
                            height: "80%",
                            alignSelf: "center",
                        }}
                        color="#888"
                        icon={pieceType.icon}
                    />
                )}
            </div>
        </>
    );
}

export default ChessPiece;
