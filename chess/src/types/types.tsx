type ChessPieceType = "PAWN" | "KNIGHT" | "BISHOP" | "ROOK" | "QUEEN" | "KING" | "BLANK";
type PieceInformation = {
    name: string;
    icon: any;
    team: "BLACK" | "WHITE" | undefined;
}

export interface ChessPiece {
    name: string;
    icon: any;
    team: "BLACK" | "WHITE";
    moveCount: number;
};

export type Point = {
    x: number | null;
    y: number | null;
}