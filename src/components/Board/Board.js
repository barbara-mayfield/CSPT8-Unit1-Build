import React, { useState, useCallback, useRef } from "react";
import styled from "styled-components";
import "./Board.css";
import produce from "immer";

const Button = styled.button`
    background: ${(props) => (props.primary ? "white" : "#4a515f")};
    color: ${(props) => (props.primary ? "#4a515f" : "white")};

    font-size: 1em;
    margin: 1em;
    padding: 0.25em 1em;
    border: 2px solid palevioletred;
    border-radius: 3px;
`;

// Set initial numbers of rows and columns
const numRows = 25;
const numCols = 25;

// we call generate grid in our useState hook
const generateGrid = () => {
    // using this 1D array
    const rows = [];

    // we can loop over it to create a 2D array
    for (let i = 0; i < numRows; i++) {
        // this generates a 2D array full of zeroes
        rows.push(Array.from(Array(numCols), () => 0));
    }

    return rows;
};

// these are all locations of the potential neighbors
// for a given grid piece, these are the operations we
// will map over in our start game function
const directions = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
];

const GameBoard = () => {
    // The values of the grid will be changing
    // So the grid will be set in state
    // Using a function here will initiate the grid one time
    // and populate the array (grid) with 0's
    const [grid, setGrid] = useState(() => {
        return generateGrid();
    });

    const [isRunning, setRunning] = useState(false);
    const [generation, setGen] = useState(0);

    // Since we are only calling "startGame" once, we need
    // a way to access the updating state of our grid.
    // useRef hook is handy for keeping any mutable value
    // around similar to how you’d use instance fields
    // in classes. We store the state in here so we can
    // have access to the current state.
    const isRunningRef = useRef(isRunning);
    isRunningRef.current = isRunning;

    const generateRandom = () => {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
            rows.push(
                Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
            );
        }

        setGrid(rows);
    };

    const randomColor = () => {
        //function name
        var color = "#"; // hexadecimal starting symbol
        var letters = [
            "e042f5",
            "4251f5",
            "42f2f5",
            "42f566",
            "ecf542",
            "f5a142",
            "f54242",
            "9700b5",
        ];
        color += letters[Math.floor(Math.random() * letters.length)];
        return color;
    };

    const startGame = useCallback(() => {
        // This is the main game loop that will run recursively

        // Kill condition, checks to see if we are currently running or not
        // If we aren't running, it kills the function.
        if (!isRunningRef.current) {
            return;
        } else {
            // This will increment the generation count as the game is running.
            setGen((prevState) => (prevState += 1));

            // So now we need to simulate while implementing our game rules
            setGrid((g) => {
                return produce(g, (gridCopy) => {
                    for (let i = 0; i < numRows; i++) {
                        for (let j = 0; j < numCols; j++) {
                            let neighbors = 0;
                            directions.forEach(([x, y]) => {
                                const newI = i + x;
                                const newJ = j + y;

                                // this is to check whether or not we are out of bounds
                                if (
                                    newI >= 0 &&
                                    newI < numRows &&
                                    newJ >= 0 &&
                                    newJ < numCols
                                ) {
                                    // if we have a live cell it's going to add 1 to the neighbors
                                    neighbors += g[newI][newJ];
                                }
                            });

                            // 1. Any live cell with fewer than 2 live neibhors dies.
                            // 2. They also die if they have greater than 3 neighbors.
                            if (neighbors < 2 || neighbors > 3) {
                                gridCopy[i][j] = 0;

                                // 3. If they have 2 or 3 live neighbors they remain alive.
                                // 4. If a dead cells have 3 neighbors it becomes alive.
                            } else if (g[i][j] === 0 && neighbors === 3) {
                                gridCopy[i][j] = 1;
                            }
                        }
                    }
                });
            });
        }
        setTimeout(startGame, 1200);
    }, []);

    const gameSpeed = (func, second) => {
        clearTimeout();
        setTimeout(func, second);
    };

    return (
        <div className="Game">
            <div>
                <h5>Generation: {generation}</h5>
            </div>
            <div
                className="Board"
                style={{
                    // grid template columns will set the number of
                    // columns the grid will go to, and the size of the cols
                    display: "grid",
                    gridTemplateColumns: `repeat(${numCols}, 25px)`,
                }}
            >
                {
                    // here we are mapping over the rows and columns
                    // the key will be the row and col "[i]-[j]"
                    // backgroundColor will be determined by the grid state
                    grid.map((rows, i) =>
                        rows.map((col, j) => (
                            <div
                                className="Grid"
                                key={`${i}-${j}`}
                                // You should not be able to click on the grid if the game loop is running
                                // The click will change the state of the cell from dead (black, 0)
                                // to alive (white, 1)
                                // So we need to be able to target a cell
                                // If cell state dead === true, change to alive (1)
                                // If cell state alive === true, change to dead (0)

                                onClick={() => {
                                    if (!isRunning) {
                                        const newGrid = produce(
                                            grid,
                                            (gridCopy) => {
                                                gridCopy[i][j] = grid[i][j]
                                                    ? 0
                                                    : 1;
                                            }
                                        );

                                        setGrid(newGrid);
                                    }
                                }}
                                style={{
                                    height: 25,
                                    width: 25,
                                    border: "1px solid white",
                                    backgroundColor: grid[i][j]
                                        ? randomColor()
                                        : undefined,
                                }}
                            ></div>
                        ))
                    )
                }
            </div>
            <div className="game-controls">
                <Button
                    className="s-button"
                    onClick={() => {
                        setRunning(!isRunning);
                        if (!isRunning) {
                            isRunningRef.current = true;
                            startGame();
                        }
                    }}
                >
                    {isRunning ? "Stop" : "Start"}
                </Button>
                <Button className="random" onClick={() => generateRandom()}>
                    Random
                </Button>
                <Button
                    className="reset-button"
                    onClick={() => {
                        setGrid(generateGrid());
                        setGen(0);
                        setRunning(false);
                    }}
                >
                    Reset
                </Button>
                <Button onClick={() => gameSpeed(startGame, 1000)}>
                    Speed It Up!
                </Button>
            </div>
        </div>
    );
};

export default GameBoard;
