import { test, expect } from "vitest";
import { vi } from "vitest";
import { getNewChessBoard } from "../utils/boardCreationLogic";
import { ControlMapNames, TeamType, PieceInformation, TileData } from "../types/types";
import { PIECE_LAYOUTS } from "../types/test_piece_boards";
import { DEFAULT_BOARD_DIMENSION } from "../components/Chessboard";

let newPieceID = 0;
const resetData = () => {
    newPieceID = 0;
}

const getMockPieceId = vi.fn(() => newPieceID++);
const getMockChessPiece = vi.fn(
    (pieceType: Pick<PieceInformation, 'name' | 'icon'>, team: TeamType): PieceInformation => 
        ({ ...pieceType, ...{ team, id: getMockPieceId() } })
);

// const getMockChessPiece = vi.fn(createChessPiece);
const getMockControlMaps = vi.fn((): Record<ControlMapNames, Map<any, Set<any>>> => ({
    'tilesOfMovement': new Map(),
    'tilesOfCapture' : new Map(),
    'pieceCptCtrl'   : new Map(),
    'pieceMvmCtrl'   : new Map()
}));

type PieceLayoutKeys = keyof typeof PIECE_LAYOUTS;

export const getNewMockDefaultBoardInformation = vi.fn((
    pieceLayoutNum: PieceLayoutKeys, 
    mirrorPieces: boolean = false
) => {
    resetData();
    return getNewChessBoard(
        PIECE_LAYOUTS[pieceLayoutNum], 
        DEFAULT_BOARD_DIMENSION, 
        DEFAULT_BOARD_DIMENSION, 
        new Map(),
        [getMockChessPiece, getMockControlMaps],
        mirrorPieces
    );
});

// NOTE: Should be testing in a different file
test('Chess piece dependencies have been called a proper number of times', () => {

    // This test is for checking dependency calls
    let { grid, pieceTable, controlMaps } = getNewMockDefaultBoardInformation(1, true);

    expect(getMockChessPiece).toHaveBeenCalledTimes(4);
    expect(getMockControlMaps).toHaveBeenCalledTimes(1);

});

test('Piece table is initialized correctly', () => {

    let { grid, pieceTable, controlMaps } = getNewMockDefaultBoardInformation(1, false);

    expect(pieceTable.size).toEqual(2);
    expect(pieceTable.get('{"x":0,"y":0}')?.name).toEqual("BISHOP");
    expect(pieceTable.get('{"x":1,"y":1}')?.name).toEqual("PAWN");

});

test('Grid is initialized correctly', () => {
    
    let { grid, pieceTable, controlMaps } = getNewMockDefaultBoardInformation(1, false);

    const tilesWithPieces: Array<TileData> = [];
    for (let rowIdx = 0; rowIdx < grid.length; rowIdx++) {
        tilesWithPieces.push(...grid[rowIdx].filter((tile) => tile.piece !== null));
    }

    expect(tilesWithPieces.length).toEqual(2);

    // Check 1st piece location (BISHOP)
    expect(tilesWithPieces[0].x).toEqual(0);
    expect(tilesWithPieces[0].y).toEqual(0);
    
    // Check 2nd piece location (PAWN)
    expect(tilesWithPieces[1].x).toEqual(1);
    expect(tilesWithPieces[1].y).toEqual(1);
    
})