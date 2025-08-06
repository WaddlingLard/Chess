import React, { useState, useEffect, useRef } from "react";

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
import PieceSelector from "./PieceSelector";

// prettier-ignore
export const PIECE_TYPE = Object.freeze({
    PAWN:   { name: "PAWN",   icon: faChessPawn },
    KNIGHT: { name: "KNIGHT", icon: faChessKnight },
    BISHOP: { name: "BISHOP", icon: faChessBishop  },
    ROOK:   { name: "ROOK",   icon: faChessRook },
    QUEEN:  { name: "QUEEN",  icon: faChessQueen },
    KING:   { name: "KING",   icon: faChessKing },
});

function ChessPiece({
    name,
    teamType,
    // originFromPieceSelector = { isOriginated: false, newPieceList: null },
    // drop = { validDropOccurred: false, toggleDrop: null },
}) {
    // Used to keep track if the chess piece came from the piece selector component
    // const { isOriginated, newPieceList } = originFromPieceSelector;

    const [pieceType, setPieceType] = useState(undefined);
    const [teamAffiliation, setTeamAffiliation] = useState(undefined);

    // const isTempPiece = isOriginated;
    // const pieceSelectorList = newPieceList;

    // const { validDropOccurred, toggleDrop } = drop;

    // useEffect(() => {
    //     console.log("New value of validDropOccurred!", drop.validDropOccurred);
    // }, [drop.validDropOccurred]);

    // console.log("Name: ", name);
    // console.log("Team type: ", teamType);

    // Set the piece type
    useEffect(() => {
        if (PIECE_TYPE[name] === undefined) {
            throw new Error("Invalid piece type provided to chess piece constructor!");
        }

        // console.log("Setting new piece", PIECE_TYPE[name]);
        setPieceType(PIECE_TYPE[name]);
    }, []);

    const chessPieceDataHandler = (event) => {
        // console.log("Piece has been grabbed!", event);

        // Grabbing the data from the dragging event to be moved
        event.dataTransfer.setData(
            "application/chess-piece",
            JSON.stringify({ id: event.target.id, pieceName: pieceType.name })
        );
        event.dataTransfer.effectAllowed = "move";

        // console.log("Before dropping dataTransfer values: ", event.dataTransfer.getData("text"));
        // console.log("Saving the dragged event");

        // currentDragEvent = event;
    };

    // const checkValidDropHandler = (event) => {
    //     console.log("Checking the validity of the drop");
    //     console.log(validDropOccurred);

    //     if (validDropOccurred) {
    //         console.log("A valid drop has occurred!");
    //         toggleDrop();
    //     }

    //     console.log(event);
    // };

    const addToPieceListHandler = () => {};

    const uniqueIDGenerator = (size) => {
        let id = String("");
        for (let i = 0; i < size; i++) {
            let idVal = String(Math.floor(Math.random() * 10));
            id = id.concat(idVal);
        }
        // console.log(`Created ID: ${id}`);
        return id;
    };

    return (
        <>
            <div
                style={{ display: "flex", width: "100%", height: "100%" }}
                draggable={true}
                onDragStart={chessPieceDataHandler}
                onDragEnd={
                    // checkValidDropHandler
                    addToPieceListHandler
                }
                id={`${uniqueIDGenerator(10)}`}
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
