import React, { useState, useEffect, useContext } from 'react';
import { TileContext } from './Chessboard';

const TILE_STATE = Object.freeze({
    EMPTY: 'EMPTY',
    HOLDING_PIECE: 'HOLDING_PIECE',
    IN_CHECK: 'IN_CHECK',
});

function ChessTile({ location }) {

    const parentContext = useContext(TileContext);
    const [position, setPosition] = useState({ row: undefined, col: undefined });
    const [currentState, setCurrentState] = useState(TILE_STATE.EMPTY);

    // Set the position of the chess tile
    useEffect(() => {
        if (location.x == undefined || location.y == undefined) {
            throw new Error("Coordinates not provided to the chess tile constructor!");
        }
        // Again, redundant naming
        setPosition((prev) => ({ row: location.x, col: location.y }));
    }, [])

    return (
        <>
            <div
                style={{
                    width: parentContext.tileSize, height: parentContext.tileSize,
                    backgroundColor: (position.row + position.col) % 2 == 0 ? '#FFF' : "#000",
                }}
            >

            </div>
        </>
    );

}

export default ChessTile;