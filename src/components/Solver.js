async function waitForClick(popup) {
    return new Promise(resolve => {
        popup.document.body.addEventListener('click', resolve, { once: true });
    });
}

function mergeChangedSquares(arr1, arr2) {
    const map = new Map();
    // Add all from arr1
    arr1.forEach(({ index, result }) => map.set(index, result));
    // Add/overwrite from arr2
    arr2.forEach(({ index, result }) => map.set(index, result));
    // Convert back to array of objects
    return Array.from(map.entries()).map(([index, result]) => ({ index: Number(index), result }));
}

function checkLine(line, clues) {
    // Returns an array with the indices of squares that were changed
    // and their new values as pairs of {index, result}
    const changedSquares = [];

    // Just need to find one type of change
    if (!clues || clues.length === 0 || (clues.length === 1 && clues[0] === 0)) {
        // If the clue is empty, fill all squares with crosses
        for (let i = 0; i < line.length; i++) {
            if (line[i] !== 1) {
                changedSquares.push({ index: i, result: 1 });
            }
        }
    }
    else if (clues[0] === line.length) {
        // If the clue is the same as the length of the line, fill all squares
        for (let i = 0; i < line.length; i++) {
            if (line[i] !== 2) {
                changedSquares.push({ index: i, result: 2 });
            }
        }
    } 
    else {
        
        // Current implementation results in duplicate results in changedSquares
        // It shouldn't be a problem, but it can be optimized
        // Wait but it's a map right. So there's no duplicates

        // checkLine() might also need to be recursive lol?

        // ----------------------------------------------------------------------
        
        // Try superimposing 

        const lineLeft = Array(line.length).fill(0);
        const lineRight = Array(line.length).fill(0);
        let leftCount = 0;
        let rightCount = 0;
        for (let i = 1; i <= clues.length; i++) {
            // Fill in one left clue
            const clueLeft = clues[i - 1];
            for (let j = 0; j < clueLeft; j++) {
                // Use i to identify which group it is
                lineLeft[leftCount] = i;
                leftCount++;
            }
            leftCount++;
            // Fill in one right clue
            const clueRight = clues[clues.length - i];
            for (let j = 0; j < clueRight; j++) {
                // Use i to identify which group it is
                lineRight[line.length - 1 - rightCount] = clues.length - i + 1;
                rightCount++;
            }
            rightCount++;
        }
        // Now superimpose the two lines
        for (let i = 0; i < line.length; i++) {
            if (lineLeft[i] === lineRight[i] && lineLeft[i] !== 0) {
                // If both are filled, fill it
                if (line[i] !== 2) {
                    changedSquares.push({ index: i, result: 2 });
                }
            }
        }

        // Apply the changed squares to a copy of the line
        if (changedSquares.length !== 0) {
            let changedLine = [...line];
            for (let i = 0; i < changedSquares.length; i++) {
                const { index, result } = changedSquares[i];
                if (changedLine[index] !== result) {
                    changedLine[index] = result;
                }
            }

            return mergeChangedSquares(
                changedSquares,
                checkLine(changedLine, clues)
            );
        }

        // ----------------------------------------------------------------------

        // Check for things that can be extended

        let clueCounter = 0; // Keep track of which clue we're on
        let clueProgress = 0; // Count how many squares we filled for the current clue
        let clueOngoing = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === 2) {
                clueProgress++;
                clueOngoing = true;
            } else if (line[i] === 1) {
                if (clueOngoing) {
                    // If we were filling, that means we finished a clue!
                    clueProgress = 0;
                    clueCounter++;
                    clueOngoing = false;
                }
            } else {
                let finishingPos = i;
                // If we reach an empty square, check if we can fill it
                if (clueOngoing && clueCounter < clues.length) {
                    // If the current clue is not finished, fill this square
                    const remainingClue = i + clues[clueCounter] - clueProgress;
                    console.log("Remaining clue length is", remainingClue);
                    for (let j = i; j < remainingClue; j++) {
                        console.log("Filling square at index", j, "for clue", clues[clueCounter]);
                        changedSquares.push({ index: j, result: 2 });
                        clueProgress++;
                        finishingPos++;
                    }
                    // Finish off the clue with a cross if needed
                    if (finishingPos < line.length && line[finishingPos] !== 1) {
                        console.log("Finishing clue at index", finishingPos, "with a cross");
                        console.log("Clue is", clues[clueCounter], "and progress is", clueProgress);
                        changedSquares.push({ index: finishingPos, result: 1 });
                        clueProgress = 0;
                        clueCounter++;
                        clueOngoing = false;
                    }
                }
                if (clueOngoing && clueCounter === clues.length) {
                    // If we finished all clues, we can fill all remaining squares
                    for (let j = finishingPos; j < line.length; j++) {
                        if (line[j] === 0) {
                            changedSquares.push({ index: j, result: 1 });
                        }
                    }
                }
                if (!clueOngoing) {
                    break;
                }
            }
        }
        
        // Apply the changed squares to a copy of the line
        if (changedSquares.length !== 0) {
            let changedLine = [...line];
            for (let i = 0; i < changedSquares.length; i++) {
                const { index, result } = changedSquares[i];
                if (changedLine[index] !== result) {
                    changedLine[index] = result;
                }
            }

            return mergeChangedSquares(
                changedSquares,
                checkLine(changedLine, clues)
            );
        }
    }

    return changedSquares;
}

function showResultsGrid(rowResults) {
    // Create HTML table
    let html = `
    <table style="border-collapse:collapse;font-size:24px;background:#fff;">
    <style>
      td.nonogram-cell {
        width:32px;height:32px;
        text-align:center;
        vertical-align:middle;
        border:1px solid #ccc;
        box-sizing:border-box;
        font-family:monospace;
        background:#fff;
        padding:0;
      }
      td.filled {
        background:#222;
        color:#222;
      }
      td.cross {
        color:#888;
        font-size:28px;
        font-weight:bold;
      }
      td.unknown {
        background:orange;
        color:#fff;
        font-size:24px;
        font-weight:bold;
      }
    </style>
    `;
    for (let i = 0; i < rowResults.length; i++) {
        html += '<tr>';
        for (let j = 0; j < rowResults[i].length; j++) {
            let cellClass = "nonogram-cell";
            let cellContent = '';
            if (rowResults[i][j] === 1) {
                cellClass += " cross";
                cellContent = '×';
            } else if (rowResults[i][j] === 2) {
                cellClass += " filled";
                cellContent = '■';
            } else {
                cellClass += " unknown";
                cellContent = '?';
            }
            html += `<td class="${cellClass}">${cellContent}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';

    // Open popup and write the table
    const popup = window.open('', 'Nonogram Solution', 'width=600,height=600');
    popup.document.write('<html><head><title>Nonogram Solution</title></head><body>' + html + '</body></html>');
    popup.document.close();
}

export const solve = async ({rows, columns}) => {
    let allLines = [];

    // First is designation, second is index
    for (let i = 0; i < rows.length; i++) {
        allLines.push(["r", i]);
    }
    for (let i = 0; i < columns.length; i++) {
        allLines.push(["c", i]);
    }

    // Initialize the queue with all lines
    const toCheck = [];
    for (let i = 0; i < allLines.length; i++) {
        toCheck.push(allLines[i]);
    }

    // Map to track if lines are already in the queue
    const linesMap = {};
    for (let i = 0; i < allLines.length; i++) {
        linesMap[allLines[i]] = true;
    }

    // Make two empty grids for results
    const rowResults = [];
    for (let i = 0; i < rows.length; i++) {
        rowResults.push([]);
        for (let j = 0; j < columns.length; j++) {
            rowResults[i].push(0);
        }
    }
    // Transpose the results grid for columns
    const colResults = rowResults[0].map((_, colIndex) => rowResults.map(row => row[colIndex]));

    // Open popup once and reuse it
    const popup = window.open('', 'Nonogram Solution', 'width=600,height=600');

    while (toCheck.length > 0) {
        console.log("Lines to check:", toCheck.length);
        // Check the first line in the queue
        const line = toCheck.shift();
        let changedSquares = [];
        if (line[0] === "r") {
            const rowIndex = line[1];
            changedSquares = checkLine(rowResults[rowIndex], rows[rowIndex]);
        } else {
            const colIndex = line[1];
            changedSquares = checkLine(colResults[colIndex], columns[colIndex]);
        }

        // Now that we have the changed squares, update both results grids 
        // and add any new lines to the queue
        for (let i = 0; i < changedSquares.length; i++) {
            const {index, result} = changedSquares[i];
            if (line[0] === "r") {
                rowResults[line[1]][index] = result; 
                colResults[index][line[1]] = result;
                // Only add to the queue if this line is not already in it
                if (!linesMap[`${line[0]}${index}`]) {
                    toCheck.push(["c", index]);
                    linesMap[`${line[0]}${index}`] = true;
                }
            } else {
                colResults[line[1]][index] = result; 
                rowResults[index][line[1]] = result; 
                // Only add to the queue if this line is not already in it
                if (!linesMap[`${line[0]}${index}`]) {
                    toCheck.push(["r", index]);
                    linesMap[`${line[0]}${index}`] = true;
                }
            }
            console.log("Updating row", line[1], "and column", index, "with result", result);
        }
        // Update linesMap to say this line is no longer in the queue
        linesMap[`${line[0]}${line[1]}`] = false;

        // Show the current grid and wait for click to continue
        showResultsGrid(rowResults, popup, line);
        await waitForClick(popup);
    }

    showResultsGrid(rowResults);

};