import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { TileContext } from "./Chessboard";
import ChessPiece from "./ChessPiece";
import { PIECE_TYPE } from "./ChessPiece";

const TILE_STATE = Object.freeze({
    EMPTY: "EMPTY",
    HOLDING_PIECE: "HOLDING_PIECE",
    IN_CHECK: "IN_CHECK",
});

function ChessTile({
    constructorData = { location: { x: 0, y: 0 }, piece: null },
    templateGrid = { tempPieceLayout: { grid: [] }, setTempPieceLayout: null },
}) {
    const { tempPieceLayout, setTempPieceLayout } = templateGrid;

    const gridPoint = constructorData.location;
    const chessPiece = constructorData.piece;
    // Add more variables for constructorData if needed

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

    // Reference to itself
    const dropDiv = useRef(null);
    // const [validDropOccurred, setValidDropOccurred] = useState(false);

    // console.log("loading new tile!", gridPoint, chessPiece, currentState, isHoveringTile, tileColor, position);

    // Set the position of the chess tile (initial use effect)
    useEffect(() => {
        if (gridPoint.x === undefined || gridPoint.y === undefined) {
            throw new Error("Coordinates not provided to the chess tile constructor!");
        }

        // Validate chess piece (if there is one), plant on the tile if valid
        // NOTE: Account for situation where sends in an empty []
        if (chessPiece !== null) {
            setCurrentState(TILE_STATE.HOLDING_PIECE);
            setChessPieceHolding(PIECE_TYPE[chessPiece.name]);
        }

        // Again, redundant naming
        setPosition((prev) => ({
            row: gridPoint.y,
            col: gridPoint.x,
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

    // const toggleDrop = () => {
    //     setValidDropOccurred(!validDropOccurred);
    // };

    const generatePiece = useMemo(() => {
        if (currentState === TILE_STATE.EMPTY) {
            // console.log("Returning null!");
            return null;
        }

        // console.log(currentState);
        try {
            return (
                <>
                    <ChessPiece
                        name={chessPieceHolding.name}
                        // drop={{ validDropOccurred, toggleDrop }}
                    />
                </>
            );
        } catch (TypeError) {
            console.log("Values at time of error:");
            console.log("CurrentState: ", currentState);
            console.log("Position: ", position);
            console.log("ConstructorData: ", constructorData);
            console.trace();
        }
    }, [
        currentState,
        chessPieceHolding,
        // validDropOccurred
    ]);

    const pieceDroppedHandler = (event) => {
        event.preventDefault();
        setIsHoveringTile(false);

        if (currentState !== TILE_STATE.EMPTY) {
            console.log("Cannot place piece on occupied tile!");
            return;
        }

        const piece = event.dataTransfer.getData("application/chess-piece");
        const data = JSON.parse(piece);

        if (piece === "") {
            throw new Error("Data has not been correctly passed into the drag start event!");
        }

        if (dropDiv === null) {
            throw new Error("Drop reference does not exist!");
        }

        // This is where the 'moving' occurs
        const pieceElement = document.getElementById(data.id);
        // dropDiv.current.appendChild(pieceElement);

        // setValidDropOccurred(true);

        const updatedGrid = tempPieceLayout.grid;

        console.log("Grid template before update: ", updatedGrid);
        // Getting the location of the piece normalized to a template board (half the height of a normal grid)
        console.log("Coordinate positions: ", position.row % tempPieceLayout.grid.length, position.col);
        const oldGridNode = updatedGrid[position.row % tempPieceLayout.grid.length][position.col];

        if (oldGridNode.length !== 0) {
            console.log("ABORTING! TILE IS ALREADY OCCUPIED!");
            return null;
        }

        oldGridNode.push(PIECE_TYPE[data.pieceName]);
        console.log("Updated template grid state:", updatedGrid);
        console.log("Updated grid node:", oldGridNode);
        console.log(
            "Updated grid node pulled from grid directly",
            updatedGrid[position.row % tempPieceLayout.grid.length][position.col]
        );

        // Update the chess board
        setTempPieceLayout((prev) => {
            console.log(prev);

            // Reverse the grid to get mirrored layout
            // const normalizedGrid = updatedGrid.reverse();

            // console.log("Normalized grid:", normalizedGrid);

            // Piece should be in the normalized grid
            // console.log(
            //     "Updated position: ",
            //     normalizedGrid[position.row % (updatedGrid.length / 2)][position.col % updatedGrid.length]
            // );

            // normalizedGrid.map((row, rowIndex) => {
            //     row.map((element, colIndex) => {
            //         console.log("element: ", row);
            //         row[colIndex] = row[colIndex].tileData.piece;
            //     });
            // });

            // console.log("Updated normalized grid: ", normalizedGrid);

            const newGrid = { ...prev, grid: updatedGrid };

            console.log(newGrid);

            return newGrid;
        });

        setCurrentState(TILE_STATE.HOLDING_PIECE);
        setChessPieceHolding(PIECE_TYPE[data.pieceName]);
        // Successful drop!
        // console.log(pieceElement);
        // Save the valid transition to the event
        // event.dataTransfer.setData("application/json", JSON.stringify({ validTransfer: true }));
    };

    return (
        <>
            <div
                onMouseEnter={() => setIsHoveringTile(true)}
                onMouseLeave={() => setIsHoveringTile(false)}
                onDragEnter={(e) => {
                    e.preventDefault();
                    setIsHoveringTile(true);
                    // console.log("Drag Enter!");
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsHoveringTile(false);
                    // console.log("Drag Leave!");
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    // console.log("Drag Over!");
                }}
                onDrop={pieceDroppedHandler}
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
                <div ref={dropDiv}>{generatePiece}</div>
                {/* <div>piece loading</div> */}
            </div>
        </>
    );
}

export default ChessTile;
