import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { DEFAULT_TILE_SIZE } from "./Chessboard";
import ChessPiece from "./ChessPiece";
import { PIECE_TYPE } from "./ChessPiece";
import { useGame } from "../contexts/GameContext";
import { useSelect } from "../contexts/SelectContext";

const TILE_STATE = Object.freeze({
    EMPTY: "EMPTY",
    HOLDING_PIECE: "HOLDING_PIECE",
    IN_CHECK: "IN_CHECK",
    TAKEN: "TAKEN"
});

function ChessTile({
    constructorData = { x: 0, y: 0, piece: null, tile: null },
    updateBoard,
    // templateGrid = { tempPieceLayout: { grid: [] }, setTempPieceLayout: null },
}) {
    
    // const { tempPieceLayout, setTempPieceLayout } = templateGrid;

    // const { boardState, setBoardState } = useGame();

    const { selectedPiece, setSelectedPiece } = useSelect();
    const { chessBoard, setChessBoard } = updateBoard;
    
    // Add more variables for constructorData if needed
    const { x, y, piece, tile } = constructorData; 
    const { selected } = tile;

    // const parentContext = useContext(TileContext);

    const [position, setPosition] = useState({
        row: undefined,
        col: undefined,
        // valueSet: false,
    });
    
    // These two states go hand-in-hand
    const [currentState, setCurrentState] = useState(TILE_STATE.EMPTY);
    const [chessPieceHolding, setChessPieceHolding] = useState(null);
    
    // States that trigger additional functionality/UI
    const [isHoveringTile, setIsHoveringTile] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    const [tileColor, setTileColor] = useState(undefined);

    // Reference to itself
    const dropDiv = useRef(null);
    // const [validDropOccurred, setValidDropOccurred] = useState(false);

    // For mounting only handle the location data, piece prop changes so handle in a separate useEffect
    useEffect(() => {
        if (x === undefined || y === undefined) {
            throw new Error("Coordinates not provided to the chess tile constructor!");
        }

        // Again, redundant naming
        setPosition((prev) => ({
            row: y,
            col: x,
            // valueSet: true,
        }));
        setTileColor((x + y) % 2 == 0 ? "#FFF" : "#000");
    }, []);

    // Resetting tile state if new chessPiece
    useEffect(() => {
        let isEmpty = currentState === TILE_STATE.EMPTY;

        if (piece === null) {
            setCurrentState(TILE_STATE.EMPTY);
            setChessPieceHolding(null);
            return;
        }

        if (isEmpty) {
            // New piece on the tile
            setCurrentState(TILE_STATE.HOLDING_PIECE);
            setChessPieceHolding({ ...piece });
            return;
        }

        // Check if the piece was captured, will likely need to account for capture logic
        let pieceIsCaptured = chessPieceHolding.team !== piece.team;

        if (pieceIsCaptured) {
            setChessPieceHolding({ ...piece });
            return;
        }        

    }, [piece]);

    useEffect(() => {
        if (!tile) return;
        const selectionStatus = tile.selected;
        setIsSelected(selectionStatus);
    }, [selected])

    const handleTileHover = (isMouseOn) => {
        if (currentState === TILE_STATE.EMPTY) {
            return;
        }
        setIsHoveringTile(isMouseOn);
    }

    const handleSelection = () => {
        if (selectedPiece === null) {
            setSelectedPiece({ y: position.row, x: position.col, piece: {...chessPieceHolding}});
            return;
        }
        
        
        if (selectedPiece.x === position.col && selectedPiece.y === position.row) {
            // Selection already on tile, untoggling
            setSelectedPiece(null);    
        } else {
            setSelectedPiece({ y: position.row, x: position.col, piece: {...chessPieceHolding}});
        }
        // setChessBoard({ 
        //     board: 
        //     chessBoard.board.map((row, rIdx) => 
        //         row.map((tileData, cIdx) => {
        //             if (rIdx === position.row && cIdx == position.col) {
        //                 return { ...tileData, ...{ tile: { ...tile, selected: !isSelected }} }; 
        //             }
        //             return tileData;
        //         })
        //     )
        // })
    }
    

    if (position.row === undefined || position.col === undefined) {
        return null;
    }

    // const toggleDrop = () => {
    //     setValidDropOccurred(!validDropOccurred);
    // };

    // const generatePiece = (name, team) => {
    //     if (!name || !team) {
    //         return null;
    //     }

    //     return (
    //         <>
    //             <ChessPiece
    //                 name={name}
    //                 teamType={team}
    //             />
    //         </>
    //     )
    // }

    // const generatePiece = useMemo(() => {
    //     if (currentState === TILE_STATE.EMPTY || chessPieceHolding === undefined) {
    //         // console.log("Returning null!");
    //         return null;
    //     }

    //     // console.log(currentState);
    //     try {
    //         return (
    //             <>
    //                 <ChessPiece
    //                     name={chessPieceHolding.name}
    //                     teamType={chessPieceHolding.team}
    //                     // drop={{ validDropOccurred, toggleDrop }}
    //                 />
    //             </>
    //         );
    //     } catch (TypeError) {
    //         console.error(TypeError);
    //         console.log("Values at time of error:");
    //         console.log("CurrentState: ", currentState);
    //         console.log("Position: ", position);
    //         console.log("ConstructorData: ", constructorData);
    //         console.log("Chess Piece Holding", chessPieceHolding === null);
    //         console.trace();
    //     }
    // }, [
    //     currentState,
    //     chessPieceHolding,
    //     // validDropOccurred
    // ]);

    // const pieceDroppedHandler = (event) => {
    //     event.preventDefault();
    //     setIsHoveringTile(false);

    //     if (currentState !== TILE_STATE.EMPTY) {
    //         console.log("Cannot place piece on occupied tile!");
    //         return;
    //     }

    //     const piece = event.dataTransfer.getData("application/chess-piece");
    //     const data = JSON.parse(piece);

    //     if (piece === "") {
    //         throw new Error("Data has not been correctly passed into the drag start event!");
    //     }

    //     if (dropDiv === null) {
    //         throw new Error("Drop reference does not exist!");
    //     }

    //     // This is where the 'moving' occurs
    //     const pieceElement = document.getElementById(data.id);
    //     // dropDiv.current.appendChild(pieceElement);

    //     // setValidDropOccurred(true);

    //     const updatedGrid = tempPieceLayout.grid;

    //     console.log("Grid template before update: ", updatedGrid);
    //     // Getting the location of the piece normalized to a template board (half the height of a normal grid)
    //     console.log("Coordinate positions: ", position.row % tempPieceLayout.grid.length, position.col);
    //     const oldGridNode = updatedGrid[position.row % tempPieceLayout.grid.length][position.col];

    //     if (oldGridNode.length !== 0) {
    //         console.log("ABORTING! TILE IS ALREADY OCCUPIED!");
    //         return null;
    //     }

    //     oldGridNode.push(PIECE_TYPE[data.pieceName]);
    //     console.log("Updated template grid state:", updatedGrid);
    //     console.log("Updated grid node:", oldGridNode);
    //     console.log(
    //         "Updated grid node pulled from grid directly",
    //         updatedGrid[position.row % tempPieceLayout.grid.length][position.col]
    //     );

    //     // Update the chess board
    //     setTempPieceLayout((prev) => {
    //         console.log(prev);

    //         // Reverse the grid to get mirrored layout
    //         const normalizedGrid = updatedGrid.toReversed();

    //         console.log(Object.is(prev, normalizedGrid));

    //         // console.log("Normalized grid:", normalizedGrid);

    //         // Piece should be in the normalized grid
    //         // console.log(
    //         //     "Updated position: ",
    //         //     normalizedGrid[position.row % (updatedGrid.length / 2)][position.col % updatedGrid.length]
    //         // );

    //         // normalizedGrid.map((row, rowIndex) => {
    //         //     row.map((element, colIndex) => {
    //         //         console.log("element: ", row);
    //         //         row[colIndex] = row[colIndex].tileData.piece;
    //         //     });
    //         // });

    //         // console.log("Updated normalized grid: ", normalizedGrid);

    //         const newGrid = { ...prev, grid: normalizedGrid };

    //         console.log(newGrid);

    //         return newGrid;
    //     });

    //     setCurrentState(TILE_STATE.HOLDING_PIECE);
    //     setChessPieceHolding(PIECE_TYPE[data.pieceName]);
    //     // Successful drop!
    //     // console.log(pieceElement);
    //     // Save the valid transition to the event
    //     // event.dataTransfer.setData("application/json", JSON.stringify({ validTransfer: true }));
    // };

    return (
        <>
            <div
                onMouseEnter={() => {
                    handleTileHover(true);
                }}
                onMouseLeave={() => {
                    handleTileHover(false)
                }}
                
                onClick={(event) => {
                    handleSelection();
                    console.log(`Clicked on row: ${position.row}, col: ${position.col}`)
                }}

                // onDragEnter={(e) => {
                //     e.preventDefault();
                //     setIsHoveringTile(true);
                // }}
                // onDragLeave={(e) => {
                //     e.preventDefault();
                //     setIsHoveringTile(false);
                // }}
                // onDragOver={(e) => {
                //     e.preventDefault();
                // }}
                // onDrop={pieceDroppedHandler}

                style={{
                    // width: parentContext.tileSize,
                    // height: parentContext.tileSize,
                    width: `${DEFAULT_TILE_SIZE}px`,
                    height: `${DEFAULT_TILE_SIZE}px`,
                    backgroundColor: (isSelected || isHoveringTile) ? "#B4D5FF" : tileColor,
                    transitionDuration: "300ms",
                    transitionProperty: "background-color",
                    transitionTimingFunction: "ease-out",
                    transitionDelay: "0ms",
                    display: "flex",
                    justifyContent: "center",
                    pointerEvents: currentState === TILE_STATE.EMPTY ? "none" : "all",
                    cursor: currentState === TILE_STATE.EMPTY ? "auto" : "pointer"
                }}
            >
                <div ref={dropDiv}>{currentState === TILE_STATE.EMPTY ? null : 
                    <ChessPiece
                    name={chessPieceHolding.name}
                    teamType={chessPieceHolding.team}
                    />
                }</div>
            </div>
        </>
    );
}

export default ChessTile;
