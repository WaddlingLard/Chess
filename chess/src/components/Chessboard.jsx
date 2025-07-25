import React, { useState, useEffect, StyleSheet } from 'react';
import '../css/chessboard.css';

function Chessboard({ width, height }) {

    const [dimension, setDimension] = useState({ width: undefined, height: undefined });

    // Initialize the dimensions for the game board
    useEffect(() => {
        if (width == undefined || height == undefined) {
            throw new Error(message = "Dimensions not provided to the game board constructor");
        }

        // The naming is a little redundant but will do for now
        setDimension({ width: width, height: height })
    }, [])

    const drawBoard = (width, height) => (
        <>
            {[...Array(width)].map((_, colIndex) => (
                <div
                    key={colIndex}
                    style={{
                        width: '60px', height: '60px',
                    }}
                >
                    {[...Array(height)].map((_, rowIndex) => (
                        <div
                            key={rowIndex}
                            style={{
                                width: '100%', height: '100%',
                                backgroundColor: (colIndex + rowIndex) % 2 == 0 ? '#FFF' : '#000'
                            }}
                        >
                            <p style={{ color: '#888', margin: 0 }}> {rowIndex}{colIndex} </p>
                        </div>
                    ))}

                </div>
            ))}
        </>
    )

    return (
        <>
            {/* Draw the board */}
            <div
                style={{
                    width: '80%',
                    height: '80%',
                    margin: 'auto',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#333',
                }}
            >
                {drawBoard(dimension.width, dimension.height)}


            </div>
        </>
    )
}

export default Chessboard;