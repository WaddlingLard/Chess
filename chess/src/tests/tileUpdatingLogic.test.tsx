import { expect, test } from 'vitest';
import { vi } from 'vitest';
import { PieceInformation, ChessMove, MoveType, Point } from '../types/types';
import { enactMoves } from '../utils/tileUpdatingLogic';
import { getNewMockDefaultBoardInformation } from './boardCreationLogic.test';

const createMockMove = vi.fn(
    (point: Point, newPoint: Point, piece: PieceInformation, moveType: MoveType): ChessMove => (
        { x: point.x, y: point.y, newX: newPoint.x, newY: newPoint.y, type: moveType, piece }
    ));

// The tests to validate the functionality of tileUpdatingLogic are as follows
// 1. Create the initial data (control maps, board, piece table)
// 2. Use fabricated Chess Moves and apply it to initial data
// 3. Verify control maps reflect new changes
// 4. Repeat (From step 2?) 

test('Control maps properly initialized', () => {
    
    // This test is only checking for control maps
    let { grid, pieceTable, controlMaps } = getNewMockDefaultBoardInformation(1);

    // This is expected from no movement and pawn is blocking
    expect(controlMaps.tilesOfMovement.get('{"x":7,"y":7}')).toBeUndefined();
    expect(controlMaps.tilesOfCapture.get('{"x":7,"y":7}')).toBeUndefined();
    
    // Pawn blocking
    expect(controlMaps.tilesOfCapture.get('{"x":1,"y":1}')).toBeDefined();
    expect(controlMaps.tilesOfMovement.get('{"x":1,"y":1}')).toBeUndefined();
    
    // Check the next tile in the blocked ray
    expect(controlMaps.tilesOfMovement.get('{"x":2,"y":2}')).toBeUndefined();
    expect(controlMaps.tilesOfCapture.get('{"x":2,"y":2}')).toBeDefined();
    expect(controlMaps.tilesOfCapture.get('{"x":2,"y":2}')?.size).toEqual(1);
    expect([...controlMaps.tilesOfCapture.get('{"x":2,"y":2}') as Set<PieceInformation>][0].id).
        toEqual(pieceTable.get('{"x":1,"y":1}')?.id);

    // Bishop holds the control
    expect(controlMaps.tilesOfCapture.get('{"x":1,"y":1}')?.size).toEqual(1);
    expect([...controlMaps.tilesOfCapture.get('{"x":1,"y":1}') as Set<PieceInformation>][0].id).
        toEqual(pieceTable.get('{"x":0,"y":0}')?.id);

});

test('Generates proper control tiles in center of board', () => {

    // This test is only checking for control maps
    let { grid, pieceTable, controlMaps } = getNewMockDefaultBoardInformation(3, false);

    // Checking 1st bishop
    const firstPieceTileCtrl: Array<string> = ['{"x":7,"y":7}','{"x":0,"y":0}','{"x":0,"y":6}','{"x":6,"y":0}'];
    const firstPieceTileList: Array<PieceInformation> = [];
    for (const key of firstPieceTileCtrl) {
        expect(controlMaps.tilesOfMovement.get(key)).toBeDefined();
        expect(controlMaps.tilesOfCapture.get(key)).toBeDefined();
        
        expect(controlMaps.tilesOfMovement.get(key)?.size).toEqual(1);
        expect(controlMaps.tilesOfCapture.get(key)?.size).toEqual(1);
        
        firstPieceTileList.push(
            ...(controlMaps.tilesOfMovement.get(key) ?? new Set()).values(),
            ...(controlMaps.tilesOfCapture.get(key)  ?? new Set()).values()
        );
    }
    expect(firstPieceTileList.every(
        (value) => value.id === pieceTable.get('{"x":3,"y":3}')?.id
    )).toBeTruthy();

    
    // Checking 2nd bishop
    const secondPieceTileCtrl: Array<string> = ['{"x":7,"y":0}','{"x":0,"y":7}','{"x":1,"y":0}','{"x":7,"y":6}'];
    const secondPieceTileList: Array<PieceInformation> = [];
    for (const key of secondPieceTileCtrl) {
        expect(controlMaps.tilesOfMovement.get(key)).toBeDefined();
        expect(controlMaps.tilesOfCapture.get(key)).toBeDefined();

        expect(controlMaps.tilesOfMovement.get(key)?.size).toEqual(1);
        expect(controlMaps.tilesOfCapture.get(key)?.size).toEqual(1);

        secondPieceTileList.push(
            ...(controlMaps.tilesOfMovement.get(key) ?? new Set<PieceInformation>()).values(),
            ...(controlMaps.tilesOfCapture.get(key) ?? new Set<PieceInformation>()).values()
        );
    }
    expect(secondPieceTileList.every(
        (piece) => piece.id === pieceTable.get('{"x":4,"y":3}')?.id
    )).toBeTruthy();

});

test('Simple move update test with a blocker on the bishop', () => {
    
    // This test is only checking for control maps
    let { grid, pieceTable, controlMaps } = getNewMockDefaultBoardInformation(1);

    const oldPoint = { x: 1, y: 1 };
    const newPoint = { x: 1, y: 2 };

    // Apply new move to control maps
    enactMoves(grid, [createMockMove(oldPoint, newPoint, pieceTable.get(JSON.stringify(oldPoint)), 'MOVE')], pieceTable, [], controlMaps);

    // See if control has been established on the other side of the board
    expect(controlMaps.tilesOfMovement.get('{"x":7,"y":7}')).toBeDefined();
    expect(controlMaps.tilesOfCapture.get('{"x":7,"y":7}')).toBeDefined();
    expect(controlMaps.tilesOfCapture.get('{"x":7,"y":7}')?.size).toEqual(1);
    expect([...controlMaps.tilesOfCapture.get('{"x":7,"y":7}') as Set<PieceInformation>][0].id).
        toEqual(pieceTable.get('{"x":0,"y":0}')?.id);

});

test('A little more complicated move update test with an additional blocker after move', () => {

    // This test is only checking for control maps
    let { grid, pieceTable, controlMaps } = getNewMockDefaultBoardInformation(2);

    const oldPoint = { x: 1, y: 1 };
    const newPoint = { x: 1, y: 2 };

    // Apply new move to control maps
    enactMoves(grid, [createMockMove(oldPoint, newPoint, pieceTable.get(JSON.stringify(oldPoint)), 'MOVE')], pieceTable, [], controlMaps);

    // See if control has been established on the other side of the board
    expect(controlMaps.tilesOfMovement.get('{"x":7,"y":7}')).toBeUndefined();
    expect(controlMaps.tilesOfCapture.get('{"x":7,"y":7}')).toBeUndefined();

    // Blocked at piece
    expect(controlMaps.tilesOfMovement.get('{"x":2,"y":2}')).toBeUndefined();
    expect(controlMaps.tilesOfCapture.get('{"x":2,"y":2}')).toBeDefined();
    
    // Next tile in the ray should be blocked out
    expect(controlMaps.tilesOfMovement.get('{"x":3,"y":3}')).toBeUndefined();
    expect(controlMaps.tilesOfCapture.get('{"x":3,"y":3}')?.size).toEqual(1);
    expect([...controlMaps.tilesOfCapture.get('{"x":3,"y":3}') as Set<PieceInformation>][0].id).
        toEqual(pieceTable.get('{"x":2,"y":2}')?.id);

    expect(controlMaps.tilesOfCapture.get('{"x":2,"y":2}')?.size).toEqual(1);
    expect([...controlMaps.tilesOfCapture.get('{"x":2,"y":2}') as Set<PieceInformation>][0].id).
        toEqual(pieceTable.get('{"x":0,"y":0}')?.id);

})