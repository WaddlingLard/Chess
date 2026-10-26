import { ControlMapNames, PieceInformation, TeamType, TileData } from "../types/types";
import { PIECE_TYPE } from "../components/ChessPiece";
import { vi } from "vitest";
import { calculateTileInfluence } from "./tileUpdatingLogic";
import { mergeMaps } from "./utils";

/**
 * Builds a grid with piece/tile information, initializes the piece table and control maps
 * @param {Pick<PieceInformation, "name" | "icon">[][]} chessPieceGrid
 * @param {number} width 
 * @param {number} height
 * @param {Map<string, PieceInformation>} pieceTable 
 * @param {[CallableFunction, CallableFunction]} dependencies
 * @param {Boolean} mirrorPieces
 * @returns {Array<Array<TileData>>}
 */
export const getNewChessBoard = (
    chessPieceGrid: Pick<PieceInformation, 'name' | 'icon'>[][],
    width: number,
    height: number,
    pieceTable: Map<string, PieceInformation>,
    dependencies: [CallableFunction, CallableFunction],
    mirrorPieces: boolean = true
): { 
    grid: TileData[][], 
    pieceTable: Map<string, PieceInformation>,
    controlMaps: Record<ControlMapNames, Map<any, Set<any>>>
} => {

    const isOtherTeam = (currentRow: number) => {
        return currentRow >= height / 2;
    };

    const grid: TileData[][] = [];

    /**@type {Map<string, PieceInformation>} */
    const pieceLocations = new Map();        

    // Iterate over the dimensions to make a base grid
    for (let rIdx = 0; rIdx < width; rIdx++) {

        const currentPieceRow = chessPieceGrid[isOtherTeam(rIdx) 
            ? rIdx % chessPieceGrid.length 
            : chessPieceGrid.length - 1 - (rIdx % chessPieceGrid.length)];
        const ignorePieceRow = !currentPieceRow.length

        grid.push([]);
        for (let cIdx = 0; cIdx < height; cIdx++) {
            const data: Partial<TileData> = { x: cIdx, y: rIdx };
            if (ignorePieceRow || currentPieceRow[cIdx] == PIECE_TYPE.BLANK || (isOtherTeam(rIdx) && !mirrorPieces)) {
                data.piece = null;
            } else {
                // Mocking the call to get a chess piece
                const pieceData = dependencies[0](currentPieceRow[cIdx], isOtherTeam(rIdx) ? "BLACK" : "WHITE")

                // Add to the piece location table
                pieceLocations.set(JSON.stringify(data), { ...pieceData }); 
                data.piece = { ...pieceData };
            }
            
            data.tile = { selected: false, validPath: false, checked: false };
            grid[rIdx][cIdx] = data as TileData;
        }
    }

    // Initialize piece tile control (movement/capture) and save it into control 
    // Mocking the call to get the control maps
    const controlMaps = dependencies[1]();
    const [movementControlMap, captureControlMap] = calculateTileInfluence(grid, pieceLocations, pieceLocations, controlMaps);
    mergeMaps(movementControlMap, controlMaps.tilesOfMovement);
    mergeMaps(captureControlMap, controlMaps.tilesOfCapture);

    // Save the piece locations into the table
    mergeMaps(pieceLocations, pieceTable);

    return { grid, pieceTable, controlMaps };
}