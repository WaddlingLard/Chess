import React, { useState, useEffect, useContext } from "react";
import { TileContext } from "./Chessboard";
import ChessPiece from "./ChessPiece";
import { PIECE_TYPE } from "./ChessPiece";

const TILE_STATE = Object.freeze({
    EMPTY: "EMPTY",
    HOLDING_PIECE: "HOLDING_PIECE",
    IN_CHECK: "IN_CHECK",
});

function ChessTile({ constructorData }) {
    const gridPoint = constructorData.location;
    const chessPiece = constructorData.piece;
    // Add more variables for constructorData if needed'

    const parentContext = useContext(TileContext);
    const [position, setPosition] = useState({
        row: undefined,
        col: undefined,
        valueSet: false,
    });
    const [currentState, setCurrentState] = useState(TILE_STATE.EMPTY);
    const [isHoveringTile, setIsHoveringTile] = useState(false);
    const [tileColor, setTileColor] = useState(undefined);

    // Set the position of the chess tile
    useEffect(() => {
        if (gridPoint.x === undefined || gridPoint.y === undefined) {
            throw new Error(
                "Coordinates not provided to the chess tile constructor!"
            );
        }

        // Validate chess piece (if there is one), plant on the tile if valid
        if (
            chessPiece !== undefined &&
            PIECE_TYPE[chessPiece.name] !== undefined
        ) {
            setCurrentState(TILE_STATE.HOLDING_PIECE);
        }

        // Again, redundant naming
        setPosition((prev) => ({
            row: gridPoint.x,
            col: gridPoint.y,
            valueSet: true,
        }));
        setTileColor((gridPoint.x + gridPoint.y) % 2 == 0 ? "#FFF" : "#000");
    }, []);

    // I believe this is pointless, moved setter for tile color outside into initial useEffect
    // useEffect(() => {
    //     if (!position.valueSet) {
    //         return;
    //     }
    // }, [position])

    return (
        <>
            <div
                onMouseEnter={() => setIsHoveringTile(true)}
                onMouseLeave={() => setIsHoveringTile(false)}
                style={{
                    width: parentContext.tileSize,
                    height: parentContext.tileSize,
                    backgroundColor: isHoveringTile ? "#B4D5FF" : tileColor,
                    transitionDuration: "300ms",
                    transitionProperty: "background-color",
                    transitionTimingFunction: "ease-out",
                    transitionDelay: "0ms",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {currentState === TILE_STATE.HOLDING_PIECE && (
                    <ChessPiece name={chessPiece.name} />
                )}
            </div>
        </>
    );
}

export default ChessTile;
