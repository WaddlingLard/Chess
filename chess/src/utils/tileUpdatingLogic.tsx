import { ChessMove, ControlMapNames, PieceContext, PieceInformation, Point, TeamType, TileData } from "../types/types";
import { mergeMaps, applySetToMap } from "./utils";
import { hasSpecialCaptureConditions, getMoveSystem, applyConditions, isCheckable } from "../components/ChessPiece";

/**
 * Updates the tiles of control (movement/capture) by removing current entries for the
 * disrupted pieces and recalculates their influence, storing them back in
 * @param {string[]} updatedTiles 
 * @param {TileData[][]} gameBoard
 * @param {Map<string, PieceInformation>} pieceTable
 * @param {Record<ControlMapNames, Map<any, Set<any>>>} controlMaps
 */
export const updateTilesOfControl = (
    updatedTiles:  string[], 
    pieceTable:    Map<string, PieceInformation>, 
    controlMaps: Record<ControlMapNames, Map<any, Set<any>>>,
    gameBoard:     TileData[][]
): void => {

    const updateInfluencePieces = /**@type {Set<PieceInformation} */(new Set());
    const { tilesOfCapture, tilesOfMovement, pieceMvmCtrl, pieceCptCtrl } = controlMaps;
    
    for (const tile of updatedTiles) {
        const mvmPieces = tilesOfMovement.get(tile) ?? new Set();
        const cptPieces = tilesOfCapture.get(tile) ?? new Set();
        
        const combinedSets = new Set([...mvmPieces, ...cptPieces]);
        for (const piece of combinedSets) {
            updateInfluencePieces.add(piece);
        }
    }
    
    const updatePieceIds = new Set();
    // We now have the pieces to update, so update them
    for (const piece of updateInfluencePieces as Set<PieceInformation>) {
        updatePieceIds.add(piece.id);
    }

    const filteredPieceTblMapLike: Array<[string, PieceInformation]> = [];
    for (const [key, value] of pieceTable.entries()) {
        if (updatePieceIds.has(value.id)) {
            filteredPieceTblMapLike.push([key, value]);
            // Apply deletion logic to previous Maps
            deletePieceCtrlEntries(tilesOfMovement, pieceMvmCtrl.get(value.id) ?? new Set(), { ...value, moveCount: undefined });
            deletePieceCtrlEntries(tilesOfCapture, pieceCptCtrl.get(value.id) ?? new Set(), { ...value, moveCount: undefined });
        }
    }

    const filteredPieceTable = new Map(filteredPieceTblMapLike);

    const [mvmCtrlMap, cptCtrlMap] = calculateTileInfluence(gameBoard, filteredPieceTable, pieceTable, controlMaps);
    mergeMaps(mvmCtrlMap, tilesOfMovement);
    mergeMaps(cptCtrlMap, tilesOfCapture);

}

/**
 * Deletes the entries existing in the tile map
 * @param {Map<string, Set<PieceInformation>>} tileMap 
 * @param {Set<Point>} pointSet 
 * @param {PieceInformation} pieceInfo
 */
const deletePieceCtrlEntries = (
    tileMap: Map<string, Set<PieceInformation>>,
    pointSet: Set<Point>,
    pieceInfo: PieceInformation
): void => {
    for (const point of pointSet.keys()) {
        const pointStr = JSON.stringify(point);
        const currentSet = tileMap.get(pointStr)!; // Caller passes in tileMap with pointStr contained
        currentSet.forEach((value) => {
            if (value.id === pieceInfo.id) {
                currentSet.delete(value);
            }
        })
        if (currentSet.size === 0) {
            tileMap.delete(pointStr);
        } else {
            tileMap.set(pointStr, currentSet);
        }
    }
}

/**
 * Finds what pieces hold influence on tiles based on movement/capture properties
 * @param {TileData[][]} grid 
 * @param {Map<string, PieceInformation>} toUpdatePieceLocations 
 * @param {Map<string, PieceInformation>} pieceTable
 * @param {Record<ControlMapNames, Map<any, Set<any>>>} controlMaps
 * @returns {[Map<string, Set<PieceInformation>>, Map<string, Set<PieceInformation>>]}
 */
export const calculateTileInfluence = (
    grid: TileData[][],
    toUpdatePieceLocations: Map<string, PieceInformation>,
    pieceTable: Map<string, PieceInformation>, 
    controlMaps: Record<ControlMapNames, Map<any, Set<any>>>
): [Map<string, Set<PieceInformation>>, Map<string, Set<PieceInformation>>] => {

    const { tilesOfMovement, tilesOfCapture, pieceMvmCtrl, pieceCptCtrl } = controlMaps;

    const mvmCtrlMap = new Map();
    const cptCtrlMap = new Map();

    for (const [pointStr, pieceInfo] of toUpdatePieceLocations.entries()) {
        
        const ghostSelection = { ...JSON.parse(pointStr), piece: pieceInfo };
        const splCptCond = hasSpecialCaptureConditions(pieceInfo);
        
        const mvmCtrlTiles = generateValidMoves(ghostSelection, pieceTable, grid, controlMaps, false, true);

        const cptMvmCtrlTiles = generateValidMoves(ghostSelection, pieceTable, grid, controlMaps, splCptCond, true);
        const cptCtrlTiles = generateValidCaptures(ghostSelection, pieceTable, grid, controlMaps, true, true);
        
        const mvmTileSet = new Set(mvmCtrlTiles);
        const cptTileSet = new Set([...cptMvmCtrlTiles, ...cptCtrlTiles]);
        
        // Contains properties that are all immutable (moveCount is just marked undefined)
        const storablePiece = { ...pieceInfo, moveCount: undefined };

        storeInfluenceInformation(pieceMvmCtrl, mvmTileSet, storablePiece);
        storeInfluenceInformation(pieceCptCtrl, cptTileSet, storablePiece);

        applySetToMap(mvmCtrlMap, mvmTileSet, storablePiece);
        applySetToMap(cptCtrlMap, cptTileSet, storablePiece);
        
    }

    return [mvmCtrlMap, cptCtrlMap];
}

/**
 * Stores the provided set using the piece as a key into the tile map
 * @param {Map<number, Set<Point>>} tileMap 
 * @param {Set<Point>} tileSet 
 * @param {PieceInformation} pieceInfo 
 */
const storeInfluenceInformation = (
    tileMap: Map<number, Set<Point>>,
    tileSet: Set<Point>, 
    pieceInfo: PieceInformation
): void => {
    const pieceKey = pieceInfo.id;
    tileMap.set(pieceKey, tileSet);
}

/**
 * Generate the valid tiles that the selected tile/piece can click on to move too
 * @param {PieceContext} selectedPiece 
 * @param {Map<string, PieceInformation>} pieceLocations 
 * @param {TileData[][]} gameBoard 
 * @param {Record<ControlMapNames, Map<any, Set<any>>>} controlMaps
 * @param {Boolean} useCaptureSystem
 * @param {Boolean} blockCheck call originated from a block check move call
 * @returns {Point[]}
 */
export const generateValidMoves = (
    // Add a parameter that calls reference maps that can me passed in (wonder if there is a better way than dumping params?)
    selectedPiece: PieceContext,
    pieceLocations: Map<string, PieceInformation>,
    gameBoard: TileData[][],
    controlMaps: Record<ControlMapNames, Map<any, Set<any>>>,
    useCaptureSystem: Boolean = false,
    blockCheck: Boolean = false
): Point[] => {
    
    /**@type {Point[]} */
    const validMovePath = [];
    // Get the piece that belongs to the selectedTile
    /**@type {PieceInformation & {moveSystem: MoveSystem | undefined}} */
    const pieceInfo = {
        ...selectedPiece.piece,
        moveSystem: { ...getMoveSystem(selectedPiece.piece.name) }
    };

    const { conditions } = pieceInfo.moveSystem;
    if (conditions) {
        applyConditions(pieceInfo, conditions);
    }

    // Grab after the conditions are applied
    let { steps, moveLimit } = { ...pieceInfo.moveSystem };
    if (useCaptureSystem) {
        steps = pieceInfo.moveSystem.capture ?? steps;
        moveLimit = pieceInfo.moveSystem.captureLimit ?? moveLimit;
    }

    let moveSteps = [...steps];
    const [currY, currX] = [selectedPiece.y!, selectedPiece.x!]; // y and x are always stored in the PieceContext, null is for initialization
    for (let i = 0; i !== (moveLimit === 0 ? -1 : moveLimit) ; i++) {
        
        if (moveSteps.length === 0) {
            break; 
        }

        for (const step of moveSteps) {
            /**@type {[number[], number[]]} */
            const [ySteps, xSteps] = step;
            const yDiff = ySteps.reduce((subtotal, currVal) => { return subtotal + currVal }) * (i + 1);
            const xDiff = xSteps.reduce((subtotal, currVal) => { return subtotal + currVal }) * (i + 1);
            /**@type {Point} */
            const newValidMove = { x: xDiff + currX, y: yDiff + currY };

            if (newValidMove.x >= gameBoard[0].length 
                || newValidMove.x < 0
                || newValidMove.y >= gameBoard.length
                || newValidMove.y < 0
            ) {
                // Out of bounds
                moveSteps = moveSteps.filter((step, idx) => { return step[0] != ySteps && step[1] != xSteps });
                continue;
            }
            
            // if (pieceLocations.has(JSON.stringify(newValidMove))) {
            if (gameBoard[newValidMove.y][newValidMove.x].piece !== null) {
                // NOTE: This is rather elementary logic, should use a player context to make the decision
                // const obstructingPiece = pieceLocations[JSON.stringify(newValidMove)];
                // if (obstructingPiece.team && obstructingPiece.team !== pieceInfo.team && !hasSpecialCapture){
                //     // Captureable piece
                //     validMovePath.push(newValidMove);
                // }

                moveSteps = moveSteps.filter((step, idx) => { return step[0] != ySteps && step[1] != xSteps });
            } else {

                // Piece is pinned check
                if (!blockCheck && !anticipatedMoveStopsCheck(
                    { 'newX': newValidMove.x, 'newY': newValidMove.y, 'type': 'MOVE', ...selectedPiece },
                    gameBoard,
                    pieceLocations,
                    pieceInfo.team,
                    controlMaps
                )) {
                    continue;
                }
                validMovePath.push(newValidMove);
            } 
        }
    }

    return validMovePath;
}

/**
 * Checks to see if a move made by a piece will block check
 * @param {ChessMove} newMove  
 * @param {TileData[][]} gameBoard
 * @param {Map<string, PieceInformation>} pieceLocations
 * @param {TeamType} team
 * @param {Record<ControlMapNames, Map<any, Set<any>>>} controlMaps
 * @returns {Boolean} 
 */
const anticipatedMoveStopsCheck = (
    newMove: ChessMove,
    gameBoard: TileData[][],
    pieceLocations: Map<string, PieceInformation>, 
    team: TeamType,
    controlMaps: Record<ControlMapNames, Map<any, Set<any>>>
): Boolean => {

    let clonedControlMaps: Record<ControlMapNames, Map<any, Set<any>>> = { ...controlMaps };
    for (const controlMap in controlMaps) {
        clonedControlMaps[controlMap as ControlMapNames] = cloneControlMap(controlMaps[controlMap as ControlMapNames]);
    }
    // const clonedControlMaps = 

    const clonedPieceLocations = new Map(((locations) => {
        const list: Array<readonly [string, PieceInformation]>= [];
        // const list: readonly (readonly [string, PieceInformation])[] = [];
        for (const [key, value] of locations.entries()) {
            // Using JSON PARSE/STRINGIFY instead of structuredClone()
            list.push([key, JSON.parse(JSON.stringify(value))]);
        }
        return list;
    })(pieceLocations));
    

    console.log('newMove' , newMove);
    let clonedBoard: TileData[][] | null = ((board) => {
        const newList = [];
        for (const row of board) {
            // Using JSON parse/stringify instead of structuredClone()
            newList.push(row.map(
                (tileData) => JSON.parse(JSON.stringify(tileData))));
        }
        return newList;
    })(gameBoard);
    clonedBoard = enactMoves(
        clonedBoard, 
        [newMove], 
        clonedPieceLocations, 
        [],
        clonedControlMaps
    );


    // From here we can use the projected board along with the updated cloned maps to detect if check no longer occurs
    const checkables = getCheckablePieces(clonedPieceLocations);
        
    if (validateCheck(checkables, clonedControlMaps.tilesOfCapture, team).length !== 0) {
        return false;
    }

    return true;
}

/**
 * Gets the pieces and their location that are checkable
 * @param {Map<string, PieceInformation>} pieceTable 
 * @return {Array<Point & PieceInformation>}
 */
export const getCheckablePieces = (
    pieceTable: Map<string, PieceInformation>
): (Point & PieceInformation)[] => {
    const checkables = [];
    for (const [pointStr, pieceInfo] of pieceTable.entries()) {
        if (isCheckable(pieceInfo)) {
            checkables.push({ ...JSON.parse(pointStr), ...pieceInfo });
        }
    }
    return checkables;
}

/**
 * Mutate the provided gameBoard with the pieces reflecting the provided moves
 * @param {TileData[][]} gameBoard 
 * @param {ChessMove[]} moves 
 * @param {Map<string, PieceInformation>} pieceTable
 * @param {React.Ref<ChessMove[]> | []} processedMoves
 * @param {Record<ControlMapNames, Map<any, Set<any>>>} controlMaps
 * @returns {TileData[][] | null}
 */
export const enactMoves = (
    gameBoard: TileData[][], 
    moves: ChessMove[], 
    pieceTable: Map<string, PieceInformation>, 
    processedMoves: React.RefObject<ChessMove[]> | [],
    controlMaps: Record<ControlMapNames, Map<any, Set<any>>>
): TileData[][] | null => {

    const currentBoard = [...gameBoard];

    const { tilesOfMovement, tilesOfCapture, pieceMvmCtrl, pieceCptCtrl } = controlMaps;

    /**@type {ChessMove[]} */
    const enactedMoves = [];

    for (const move of moves) {
        const { x, y, newX, newY, piece, type } = move;
        const oldTileKey = JSON.stringify({x, y});
        const newTileKey = JSON.stringify({ x: newX, y: newY });

        // NOTE: Piece validation is checked for, but might need to account for tile (newX, newY) as well
        const pieceValidated = pieceTable.has(oldTileKey) && JSON.stringify(piece) === JSON.stringify(pieceTable.get(oldTileKey));
        if (!pieceValidated) {
            // Handle error inside component
            return null;
            // setErrorMessage("Piece failed validation at move where it was requested!");
            // setErrorFlag(true);
        }

        // Update the move count
        const updatedPiece = pieceTable.get(oldTileKey) as Required<PieceInformation>; // pieceValidated has been verified
        // console.log(updatedPiece, pieceTable, move);
        updatedPiece.moveCount += 1;
        pieceTable.set(oldTileKey, updatedPiece);

        // Move the piece
        currentBoard[y][x].piece = null; 
        // Should consider using move type instead
        if (pieceTable.has(newTileKey)) {
            let capturedPiece = pieceTable.get(newTileKey)!;
            // This piece is being captured, remove its control information
            pieceTable.delete(newTileKey);
            deletePieceCtrlEntries(tilesOfMovement, pieceMvmCtrl.get(capturedPiece.id), capturedPiece);
            deletePieceCtrlEntries(tilesOfCapture, pieceCptCtrl.get(capturedPiece.id), capturedPiece);
            pieceMvmCtrl.delete(capturedPiece.id);
            pieceCptCtrl.delete(capturedPiece.id);
        }
        currentBoard[newY][newX].piece = updatedPiece;
        
        // Change the table to reflect the piece location
        pieceTable.set(newTileKey, updatedPiece);
        pieceTable.delete(oldTileKey);
        enactedMoves.push(move);

        // Updating tiles of control
        updateTilesOfControl(
            [oldTileKey, newTileKey],
            pieceTable,
            controlMaps,
            currentBoard);
    }

    // Not a fan of this solution should rethink the method instead
    if (processedMoves && !(processedMoves instanceof Array)) {
        processedMoves.current = processedMoves.current.concat(enactedMoves);
    }

    return currentBoard;
}

/**
 * Checks to see if there are any checkable pieces that are covered in the control map by
 * an unfriendly piece
 * @param {Array<Point & PieceInformation>} checkableTiles
 * @param {Map<string, Set<PieceInformation>>} captureMap 
 * @param {TeamType} checkableTeam
 * @return {Point[]}
 */
export const validateCheck = (
    checkableTiles: Array<Point & PieceInformation>,
    captureMap: Map<string, Set<PieceInformation>>,
    checkableTeam: TeamType
): Point[] => {

    const checkedTiles = [];

    for (const { x, y, team } of checkableTiles) {
        if (checkableTeam !== team) {
            continue;
        }
        const pointStr = JSON.stringify({x, y});
        let exertingPieces;
        // Compare point against the Control Map
        if (captureMap.has(pointStr)) {
            exertingPieces = captureMap.get(pointStr)!;
            if (Array.from(exertingPieces).every((piece) => piece.team === team)) {
                // All pieces are friendly that exert capture control
                continue;
            }
            checkedTiles.push({x, y});
        }
    }
    return checkedTiles;
}

/**
 * Generate the tiles that are valid for attacking by the selectedPiece
 * @param {PieceContext} selectedPiece 
 * @param {Map<string, PieceInformation} pieceLocations
 * @param {TileData[][]} gameBoard
 * @param {Record<ControlMapNames, Map<any, Set<any>>>} controlMaps 
 * @param {Boolean} ignoreTeam
 * @param {Boolean} blockCheck call originated from a block check move call
 * @returns {Point[]}
 */
export const generateValidCaptures = (
    selectedPiece: PieceContext, 
    pieceLocations: Map<string, PieceInformation>, 
    gameBoard: TileData[][],
    controlMaps: Record<ControlMapNames, Map<any, Set<any>>>,
    ignoreTeam: Boolean = false, 
    blockCheck: Boolean = false
): Point[] => {

    /**@type {Point[]} */
    const pieceTilesAttacked = [];

    /**@type {PieceInformation & {moveSystem: MoveSystem}} */
    const pieceInfo = { 
        ...selectedPiece.piece, 
        moveSystem: { ...getMoveSystem(selectedPiece.piece.name) } 
    };

    const { team } = pieceInfo;
    const { conditions } = pieceInfo.moveSystem;
    if (conditions) {
        applyConditions(pieceInfo, conditions);
    }

    /**@type {TeamType} */
    const oppositionTeam = team === 'WHITE' ? 'BLACK' : 'WHITE';
    const pieceLocationIter = pieceLocations.keys();
    const pieceLocationKeys = [...pieceLocationIter];
    
    // Sort by closest pieces to the selectedPiece
    pieceLocationKeys.sort((aKey, bKey) => {
        const keyValues = [JSON.parse(aKey), JSON.parse(bKey)];
        const [aNode, bNode] = keyValues;
        const aDistance = Math.abs(aNode.x - selectedPiece.x) + Math.abs(aNode.y - selectedPiece.y);
        const bDistance = Math.abs(bNode.x - selectedPiece.x) + Math.abs(bNode.y - selectedPiece.y);
        return aDistance - bDistance;
    });

    // Does the piece have special capture conditions?
    const { capture, captureLimit, steps, moveLimit } = pieceInfo.moveSystem
    const hasSpecialCapture = capture !== undefined;
    let validCaptureMoves = [...(hasSpecialCapture ? capture : steps)];
    
    const [xCurr, yCurr] = [selectedPiece.x, selectedPiece.y];
    for (const locationKey of pieceLocationKeys) {
        const { x, y } = JSON.parse(locationKey);
        const [xDelta, yDelta] = [x - xCurr, y - yCurr]

        if (validCaptureMoves.length == 0) {
            break;
        }

        for (const step of validCaptureMoves) {
            /**@type {[number[], number[]]} */
            const [ySteps, xSteps] = step;
            const yDiff = ySteps.reduce((subtotal, currVal) => { return subtotal + currVal });
            const xDiff = xSteps.reduce((subtotal, currVal) => { return subtotal + currVal });

            // Position is even achievable to reach with provided steps
            const ignoreX = !xDiff && xCurr === x;
            const ignoreY = !yDiff && yCurr === y;
            let xHops, yHops;

            if ((!xDiff && !ignoreX) || (!yDiff && !ignoreY)) {
                continue;
            } 

            xHops = ignoreX ? undefined: xDelta / xDiff;
            yHops = ignoreY ? undefined: yDelta / yDiff;
            
            // This will make the verification process much simpler
            if (ignoreX) {
                xHops = yHops;
            } else if (ignoreY) {
                yHops = xHops;
            }

            // We need to
            // 1. Check they are equal, if undefined ignore this step
            if (xHops !== yHops) {
                continue;
            }

            // 2. Check they are whole and positive, by only checking one
            if (xHops < 1 || xHops !== Math.floor(xHops)) {
                continue;
            }
            
            // 3. Check they are under the limit
            if (hasSpecialCapture && (captureLimit !== 0 && xHops > captureLimit) 
                || !hasSpecialCapture && (moveLimit !== 0 && xHops > moveLimit)) {
                // Move limit exceeded
                continue;
            }

            
            if (ignoreTeam ||
                pieceLocations.get(locationKey)!.team === oppositionTeam) // There will always be a piece with the provided location key (keys are sourced from the piece table)
                {
                // Move stops check
                // if (!blockCheck && gameStatus === 'CHECK' 
                //     && !anticipatedMoveStopsCheck(
                //         { 'newX': x, 'newY': y, 'type': 'CAPTURE', ...selectedPiece }, 
                //         chessBoard.board,
                //         pieceLocations,
                //         pieceInfo.team,
                //     )) {
                //     validCaptureMoves = validCaptureMoves.filter((stepTuple) => stepTuple[0] !== ySteps && stepTuple[1] !== xSteps);
                //     continue;
                // }

                // Piece is pinned check
                if (!blockCheck && !anticipatedMoveStopsCheck(
                    { 'newX': x, 'newY': y, 'type': 'CAPTURE', ...selectedPiece },
                    gameBoard,
                    pieceLocations,
                    pieceInfo.team,
                    controlMaps
                )) {
                    validCaptureMoves = validCaptureMoves.filter((stepTuple) => stepTuple[0] !== ySteps && stepTuple[1] !== xSteps);
                    continue;
                }
                
                // Target found!
                pieceTilesAttacked.push({ x, y });
            }

            // Remove the move path, a piece has been found in that path!
            validCaptureMoves = validCaptureMoves.filter((stepTuple) => stepTuple[0] !== ySteps && stepTuple[1] !== xSteps);

        }
    }
    
    console.log(pieceTilesAttacked);
    
    return pieceTilesAttacked;
}

/**
 * Clone the provided control map
 * @param {Map<any, Set<any>>} controlMap
 * @returns {Map<any, Set<any>>}
 */
const cloneControlMap = (
    controlMap: Map<any, Set<any>>
): Map<any, Set<any>> => {
    
    const copiedMapEntries: Array<[any, Set<any>]> = [];
    for (const [key, value] of controlMap.entries()) {
        const setEntries = [...value.values()];
        copiedMapEntries.push([key, new Set((
            (entries) => entries.map((entry) => JSON.parse(JSON.stringify(entry)))
        )(setEntries))]);
    }
    const newMap = new Map(copiedMapEntries);

    // for (const key in controlMaps) {
    //     console.log(key);
    //     const { current } = controlMaps[key];
    //     clonedMaps[key] = new Map(((map) => {
    //         const list = [];
    //         for (const [key, value] of map.entries()) {
    //             const setEntries = [...value.values()];
    //             list.push([key, new Set(((values) => {
    //                 return values.map((entry) => JSON.parse(JSON.stringify(entry)));
    //             })(setEntries))]);
    //         }
    //         return list;
    //     })(current));
    // }

    return newMap;
}