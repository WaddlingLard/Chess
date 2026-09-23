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
import { STEP_FUNCTIONS } from "../types/piece_moves";

/**@typedef {Array<Array<Array<number>>} StepList*/

/**
 * @typedef {Object} MoveSystem
 * @property {StepList} steps
 * @property {number} limit
 * @property {Record<string, Function>} conditions
 */

/**
 * @typedef {{ 
 * name: string, 
 * icon: any, 
 * team?: TeamType 
 * moveCount: number
 * }} PieceInformation
 */

/**
 * @typedef {"WHITE" | "BLACK"} TeamType
 */

/**
 * @typedef {"PAWN" | "KNIGHT" | "BISHOP" | "ROOK" | "QUEEN" | "KING" | "BLANK"} ChessPieceType
 * @type {Record<ChessPieceType, Omit<PieceInformation, 'moveCount' | 'team'>>}
 */
// prettier-ignore
export const PIECE_TYPE = Object.freeze({
    PAWN:   { name: "PAWN",   icon: faChessPawn },
    KNIGHT: { name: "KNIGHT", icon: faChessKnight },
    BISHOP: { name: "BISHOP", icon: faChessBishop  },
    ROOK:   { name: "ROOK",   icon: faChessRook },
    QUEEN:  { name: "QUEEN",  icon: faChessQueen },
    KING:   { name: "KING",   icon: faChessKing },
    BLANK:  { name: null,      icon: null }
});

/**
 * Invert the moves provided the team condition is met
 * @param {number[][]} stepTuple 
 * @param {TeamType} thisTeam
 * @param {TeamType} teamCondition
 * @returns {number[][]}
 */
const invertMovesUponTeamType = (stepTuple, thisTeam, teamCondition) => {
    const [ySteps, xSteps] = stepTuple;
    return thisTeam === teamCondition ? [ySteps, xSteps] : [ySteps.map((step) => step * -1), xSteps.map((step) => step * -1)];
}

/**
 * How the system works:
 * Pieces will have a MOVE_SYSTEM that contains the steps, limit, and conditions
 * While most pieces will follow their initial provided data, others will require a check beforehand (*eyes pawn*)
 * This is where conditions come in, they compute during runtime to recalculate the pieces initial data
 * Following this system, one could create any chess piece they desire. As long as their behavior can be tracked
 * via the step functions (steps), move path size (limit), and capture conditions (capture)
 */
/**@type {Record<ChessPieceType, MoveSystem} */
export const PIECE_MOVE_SYSTEM = Object.freeze({
    PAWN:   { steps: [...STEP_FUNCTIONS.FORWARD],                                  limit: 1, 
        conditions: { 
        steps() { return PIECE_MOVE_SYSTEM.PAWN.steps.map((stepTuple) => invertMovesUponTeamType(stepTuple, this.team, "WHITE"))}, 
        limit() { return (this.moveCount ?? -1) == 0 ? 2 : 1; },
        capture() { return STEP_FUNCTIONS.LEFT_AND_RIGHT.map((stepTuple) => invertMovesUponTeamType(stepTuple, this.team, "WHITE"))} 
    } },
    KNIGHT: { steps: [...STEP_FUNCTIONS.HORSE],                                    limit: 1, conditions: {} },
    BISHOP: { steps: [...STEP_FUNCTIONS.DIAGONAL],                                 limit: 0, conditions: {} },
    ROOK:   { steps: [...STEP_FUNCTIONS.INTERSECTION],                             limit: 0, conditions: {} },
    QUEEN:  { steps: [...STEP_FUNCTIONS.DIAGONAL, ...STEP_FUNCTIONS.INTERSECTION], limit: 0, conditions: {} },
    KING:   { steps: [...STEP_FUNCTIONS.DIAGONAL, ...STEP_FUNCTIONS.INTERSECTION], limit: 1, conditions: {} },
    BLANK:  { steps: [], limit: 0, conditions: {} },
});

const VALID_TEAM_TYPES = ["WHITE", "BLACK"];

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

    // Set the piece type and team affiliation
    useEffect(() => {
        if (PIECE_TYPE[name] === undefined) {
            throw new Error("Invalid piece type provided to chess piece constructor!");
        }
        
        setPieceType(PIECE_TYPE[name]);

        if (!VALID_TEAM_TYPES.includes(teamType)) {
            // setTeamAffiliation("WHITE");
            // return;
            throw new Error(`Unknown team type provided: ${teamType}`);
        }

        // console.log("Setting new piece", PIECE_TYPE[name]);
        setTeamAffiliation(teamType);
    }, []);

    useEffect(() => {
        if (pieceType !== PIECE_TYPE[name]) {
            setPieceType(PIECE_TYPE[name]);
        }
        if (teamAffiliation !== teamType) {
            setTeamAffiliation(teamType);
        }
    }, [name, teamType])

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
                draggable={false}
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
                        color={teamAffiliation === "WHITE" ? "#AAA" : "#444"}
                        // swapOpacity={true}
                        // border={true}
                        icon={pieceType.icon}
                    />
                )}
            </div>
        </>
    );
}

export default ChessPiece;
