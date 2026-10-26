// CHESS PIECE DATATYPES

export type TeamType = "WHITE" | "BLACK";

export type ChessPieceType = "PAWN" | "KNIGHT" | "BISHOP" | "ROOK" | "QUEEN" | "KING" | "BLANK";

export type PieceInformation = {
    name: ChessPieceType;
    icon: any;
    team: TeamType;
    id: number;
    moveCount?: number;
};

export interface ChessPiece {
    name: string;
    icon: any;
    team: "BLACK" | "WHITE";
    moveCount: number;
};

export type StepList = number[][][];

export type StepFunctionType = 'FORWARD' | 'DIAGONAL' | 'INTERSECTION' | 'HORSE' | 'LEFT_AND_RIGHT';

export interface MoveSystem {
    steps: StepList;
    moveLimit: number;
    conditions: Record<string, Function>;
    checkable: boolean;
    capture?: StepList;
    captureLimit?: number;
};

// CHESS TILE DATATYPES
export type TileConditionData = {
    selected: boolean;
    validPath: boolean;
    checked: boolean;
};

export type TileState = "EMPTY" | "HOLDING_PIECE" | "IN_CHECK" | "TAKEN";

// CHESSBOARD DATATYPES
export type Point = {
    x: number | null;
    y: number | null;
};

export type ControlMapNames = "tilesOfMovement" | "tilesOfCapture" | "pieceMvmCtrl" | "pieceCptCtrl";

export type TileData = Point & { piece: PieceInformation | null, tile: TileConditionData };

// MOVE CONTEXT TYPES
export type ChessMove = PieceContext & { newX: number, newY: number, type: MoveType };

// The significance of this type needs to be thought out more
export type MoveType = "CHECK" | "MOVE" | "CAPTURE";

// SELECT CONTEXT TYPES
export type PieceContext = Point & { piece: PieceInformation };

// GAME CONTEXT TYPES
export type GameStatus = "WAITING" | "IN_PROGRESS" | "CHECK" | "DRAW" | "FLAG" | "CHECKMATE";
