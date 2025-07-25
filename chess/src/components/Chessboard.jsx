import React, { useState, useEffect, StyleSheet } from 'react';
import '../css/chessboard.css';

function Chessboard({ width, height }) {

    const [dimension, setDimension] = useState({ width: undefined, height: undefined });
    const DEFAULT_BOX_SIZE = 60;

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
                        width: `${DEFAULT_BOX_SIZE}px`, height: `${DEFAULT_BOX_SIZE}px`,
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
                    width: `${(DEFAULT_BOX_SIZE) * dimension.width}px`,
                    height: `${(DEFAULT_BOX_SIZE) * dimension.height}px`,
                    // width: 'fit-content',
                    // height: 'fit-content',
                    // aspectRatio: 1 / 1,
                    // margin: 'auto',
                    // padding: '5%',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${dimension.width}, 1fr)`,
                    padding: '6%',
                    // margin: '5%',
                    borderRadius: '24px',
                    // flexDirection: 'row',
                    justifyContent: 'center',
                    // justifySelf: 'center',
                    // alignItems: 'center',
                    backgroundColor: '#55342B',
                    // overflow: 'hidden',
                    // zIndex: 2,
                    // boxSizing: 'border-box',
                }}
            >
                {/* <div style={{
                    display: 'flex',
                    margin: 'auto'
                }}> */}
                {drawBoard(dimension.width, dimension.height)}

                {/* </div> */}


            </div>
        </>
    )
}

export default Chessboard;