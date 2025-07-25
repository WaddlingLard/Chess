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

    const drawBoard = () => ({


    });

    return (
        <>
            {/* Draw the board */}
            <div
                style={{
                    width: '80%',
                    height: '80%',
                    margin: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#333',
                }}
            >

            </div>
        </>
    )
}

export default Chessboard;