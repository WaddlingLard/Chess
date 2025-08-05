import React, { useState, useEffect, useContext, useMemo } from "react";
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
    const [chessPieceHolding, setChessPieceHolding] = useState(null);

    // console.log("loading new tile!", gridPoint, chessPiece, currentState, isHoveringTile, tileColor, position);

    // Set the position of the chess tile (initial use effect)
    useEffect(() => {
        if (gridPoint.x === undefined || gridPoint.y === undefined) {
            throw new Error("Coordinates not provided to the chess tile constructor!");
        }

        // Validate chess piece (if there is one), plant on the tile if valid
        if (chessPiece !== null) {
            setCurrentState(TILE_STATE.HOLDING_PIECE);
            setChessPieceHolding(PIECE_TYPE[chessPiece.name]);
        }

        // Again, redundant naming
        setPosition((prev) => ({
            row: gridPoint.x,
            col: gridPoint.y,
            valueSet: true,
        }));
        setTileColor((gridPoint.x + gridPoint.y) % 2 == 0 ? "#FFF" : "#000");
    }, []);

    // Resetting tile state if new chessPiece
    useEffect(() => {
        if (chessPiece === null) {
            setCurrentState(TILE_STATE.EMPTY);
            setChessPieceHolding(null);
        } else {
            setCurrentState(TILE_STATE.HOLDING_PIECE);
            setChessPieceHolding(PIECE_TYPE[chessPiece.name]);
        }
    }, [chessPiece]);

    const generatePiece = useMemo(() => {
        if (currentState === TILE_STATE.EMPTY) {
            // console.log("Returning null!");
            return null;
        }

        // console.log(currentState);
        try {
            return (
                <>
                    <ChessPiece name={chessPieceHolding.name} />
                </>
            );
        } catch (TypeError) {
            console.log("Values at time of error:");
            console.log("CurrentState: ", currentState);
            console.log("Position: ", position);
            console.log("ConstructorData: ", constructorData);

            console.trace();
        }
    }, [currentState, chessPieceHolding]);

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
                {generatePiece}
                {/* <div>piece loading</div> */}
            </div>
        </>
    );
}

export default ChessTile;
