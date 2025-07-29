import React, { useState, useEffect, useContext } from 'react';
import { TileContext } from './Chessboard';

const TILE_STATE = Object.freeze({
    EMPTY: 'EMPTY',
    HOLDING_PIECE: 'HOLDING_PIECE',
    IN_CHECK: 'IN_CHECK',
});

function ChessTile({ constructorData }) {

    const gridPoint = constructorData.location;
    // Add more variables for constructorData if needed

    const parentContext = useContext(TileContext);
    const [position, setPosition] = useState({ row: undefined, col: undefined, valueSet: false });
    const [currentState, setCurrentState] = useState(TILE_STATE.EMPTY);
    const [isHoveringTile, setIsHoveringTile] = useState(false);
    const [tileColor, setTileColor] = useState(undefined);

    // Set the position of the chess tile
    useEffect(() => {
        if (gridPoint.x == undefined || gridPoint.y == undefined) {
            throw new Error("Coordinates not provided to the chess tile constructor!");
        }
        // Again, redundant naming
        setPosition((prev) => ({ row: gridPoint.x, col: gridPoint.y, valueSet: true }));
    }, [])

    useEffect(() => {
        if (!position.valueSet) {
            return;
        }
        setTileColor((position.row + position.col) % 2 == 0 ? '#FFF' : '#000');
    }, [position])

    return (
        <>
            <div
                onMouseEnter={() => setIsHoveringTile(true)}
                onMouseLeave={() => setIsHoveringTile(false)}
                style={{
                    width: parentContext.tileSize, height: parentContext.tileSize,
                    backgroundColor: isHoveringTile ? '#B4D5FF' : tileColor,
                    transitionDuration: '300ms',
                    transitionProperty: 'background-color',
                    transitionTimingFunction: 'ease-out',
                    transitionDelay: '0ms',
                }}
            >

            </div>
        </>
    );

}

export default ChessTile;