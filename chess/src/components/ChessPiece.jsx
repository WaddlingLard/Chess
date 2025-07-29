import React, { useState, useEffect } from 'react';

export const PIECE_TYPE = Object.freeze({
    PAWN: 'PAWN',
    KNIGHT: 'KNIGHT',
    BISHOP: 'BISHOP',
    ROOK: 'ROOK',
    QUEEN: 'QUEEN',
    KING: 'KING',
})

function ChessPiece({ name }) {

    const [pieceType, setPieceType] = useState(undefined);

    // Set the piece type
    useEffect(() => {
        if (PIECE_TYPE[name] == undefined) {
            throw new Error('Invalid piece type provided to chess piece constructor!');
        }

        setPieceType(PIECE_TYPE[name]);
    }, [])

    return (
        <>
            <div>
                <p style={{ color: '#55F' }}> {pieceType} </p>
            </div>
        </>
    );

}

export default ChessPiece;