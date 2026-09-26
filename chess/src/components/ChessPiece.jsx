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
 * @property {number} moveLimit
 * @property {StepList} [capture]
 * @property {number} [captureLimit]
 * @property {Record<string, Function>} conditions
 */

/**
 * @typedef {{ 
 * name: ChessPieceType, 
 * icon: any, 
 * team?: TeamType 
 * moveCount?: number
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
 * With the reference of the piece information provided, apply the conditions to that object with the
 * conditions provided
 * @param {PieceInformation & { moveSystem: MoveSystem } } pieceInfo 
 * @param {Record<string, Function>} conditions 
 * @returns {None}
 */
export const applyConditions = (pieceInfo, conditions) => {
    for (const key in conditions) {
        const bindContextCallable = conditions[key].bind(pieceInfo)
        pieceInfo.moveSystem[key] = bindContextCallable();
    }
}

/**
 * How the system works:
 * Pieces will have a MOVE_SYSTEM that contains the steps, moveLimit, and conditions
 * While most pieces will follow their initial provided data, others will require a check beforehand (*eyes pawn*)
 * This is where conditions come in, they compute during runtime to recalculate the pieces initial data
 * Following this system, one could create any chess piece they desire. As long as their behavior can be tracked
 * via the step functions (steps), move path size (moveLimit), and capture conditions (capture)
 */
/**@type {Record<ChessPieceType, MoveSystem} */
export const PIECE_MOVE_SYSTEM = Object.freeze({
    PAWN:   { steps: [...STEP_FUNCTIONS.FORWARD],                                  moveLimit: 1, 
        conditions: { 
            steps() { return PIECE_MOVE_SYSTEM.PAWN.steps.map((stepTuple) => invertMovesUponTeamType(stepTuple, this.team, "WHITE"))}, 
            moveLimit() { return (this.moveCount ?? -1) == 0 ? 2 : 1; },
            capture() { return STEP_FUNCTIONS.LEFT_AND_RIGHT.map((stepTuple) => invertMovesUponTeamType(stepTuple, this.team, "WHITE"))},
            captureLimit() { return 1; }
        } 
    },
    // PAWN:   { steps: [...STEP_FUNCTIONS.FORWARD],                                  moveLimit: 1, 
    //     conditions: { 
    //     steps: PIECE_MOVE_SYSTEM.PAWN.steps.map((stepTuple) => invertMovesUponTeamType(stepTuple, this.team, "WHITE")), 
    //     moveLimit: (this.moveCount ?? -1) == 0 ? 2 : 1,
    //     capture: STEP_FUNCTIONS.LEFT_AND_RIGHT.map((stepTuple) => invertMovesUponTeamType(stepTuple, this.team, "WHITE")) 
    // },
    KNIGHT: { steps: [...STEP_FUNCTIONS.HORSE],                                    moveLimit: 1, conditions: {} },
    BISHOP: { steps: [...STEP_FUNCTIONS.DIAGONAL],                                 moveLimit: 0, conditions: {} },
    ROOK:   { steps: [...STEP_FUNCTIONS.INTERSECTION],                             moveLimit: 0, conditions: {} },
    QUEEN:  { steps: [...STEP_FUNCTIONS.DIAGONAL, ...STEP_FUNCTIONS.INTERSECTION], moveLimit: 0, conditions: {} },
    KING:   { steps: [...STEP_FUNCTIONS.DIAGONAL, ...STEP_FUNCTIONS.INTERSECTION], moveLimit: 1, conditions: {} },
    BLANK:  { steps: [], moveLimit: 0, conditions: {} },
});

const VALID_TEAM_TYPES = ["WHITE", "BLACK"];

/**
 * Gets the move system for the provided piece name
 * @param {ChessPieceType} pieceName
 * @param {React.Dispatch<SetStateAction<boolean>>} errorSetter 
 * @param {React.Dispatch<SetStateAction<string>>} errorMessageSetter 
 * @returns {MoveSystem}
 */
export const getMoveSystem = (pieceName, errorSetter, errorMessageSetter) => {

    if (pieceName in PIECE_MOVE_SYSTEM){
        return { ...PIECE_MOVE_SYSTEM[pieceName]}
    } else {
        errorSetter(true);
        errorMessageSetter(`Failed to acquire move system for ${pieceName} chess piece!`); 
        return PIECE_MOVE_SYSTEM.BLANK; // Default to avoid null return
    }

}

function ChessPiece({
    name,
    teamType,
    location,
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
