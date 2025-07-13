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

function superimposeLines(line, clues) {
    const changedSquares = [];
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
    return changedSquares;
}

function extendLine(line, clues) {
    const changedSquares = [];
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
    return changedSquares;
}

function applyChangesToLine(line, changedSquares) {
    // Apply the changed squares to a copy of the line
    let changedLine = [...line];
    for (let i = 0; i < changedSquares.length; i++) {
        const { index, result } = changedSquares[i];
        if (changedLine[index] !== result) {
            changedLine[index] = result;
        }
    }
    return changedLine;
}

function checkLine(line, clues) {
    // Returns an array with the indices of squares that were changed
    // and their new values as pairs of {index, result}
    let changedSquares = [];

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

        // ----------------------------------------------------------------------

        // If line is filled in on one or both sides, just pass in the reduced middle section
        

        // ----------------------------------------------------------------------
        
        // Try superimposing 
        changedSquares = superimposeLines(line, clues);
        if (changedSquares.length !== 0) {
            let changedLine = applyChangesToLine(line, changedSquares);
            return mergeChangedSquares(
                changedSquares,
                checkLine(changedLine, clues)
            );
        }

        // ----------------------------------------------------------------------

        // Check for things that can be extended
        // Check from the left side
        changedSquares = extendLine(line, clues);
        if (changedSquares.length !== 0) {
            let changedLine = applyChangesToLine(line, changedSquares);
            return mergeChangedSquares(
                changedSquares,
                checkLine(changedLine, clues)
            );
        }
        // Check from the right side
        let reversedLine = [...line].reverse();
        let reversedClues = [...clues].reverse();
        changedSquares = extendLine(reversedLine, reversedClues);
        if (changedSquares.length !== 0) {
            // Map indices back to original orientation
            const mappedSquares = changedSquares.map(({ index, result }) => ({
                index: line.length - 1 - index,
                result
            }));
            let changedLine = applyChangesToLine(line, changedSquares);
            changedLine = changedLine.reverse(); // Reverse back to original order
            return mergeChangedSquares(
                mappedSquares,
                checkLine(changedLine, clues)
            );
        }

        // ----------------------------------------------------------------------

        // More ideas:
        // - (NO because one clue could be broken into many blobs) Check if line has enough clue "blobs", if so, fill everything else with crosses
        // - Check remaining clues, and cross out anything between two crosses that's smaller than the smallest clue
        // - After the above, check how many "open blobs" there are, and try superimposing
        // - "Glue": push from the edge, when the clue is larger than the spaces from the side
        // - "Mercury": I think this is just a special case of the first idea

    }

    return changedSquares;
}

function showResultsGrid(rowResults, popup, line, showButton = false, onShowSolution = null) {
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
    if (line) {
        html += `<div style="margin-top:10px;font-size:18px;">Last checked: ${line[0] === "r" ? "Row" : "Column"} ${line[1]}. Click anywhere to continue.</div>`;
    } else {
        html += `<div style="margin-top:10px;font-size:18px;">Done!</div>`;
    }
    if (showButton) {
        html += `<button id="show-solution-btn">Show Solution Instantly</button>`;
    }
    popup.document.body.innerHTML = html;

    // Attach the button handler if needed
    if (showButton && onShowSolution) {
        popup.document.getElementById('show-solution-btn').onclick = onShowSolution;
    }
}

function processLine(line, index, isRow, rowResults, colResults, rows, columns, linesMap, toCheck) {
    let changedSquares = [];
    if (isRow) {
        changedSquares = checkLine(rowResults[index], rows[index]);
    } else {
        changedSquares = checkLine(colResults[index], columns[index]);
    }

    for (let i = 0; i < changedSquares.length; i++) {
        const {index: cellIdx, result} = changedSquares[i];
        if (isRow) {
            rowResults[index][cellIdx] = result; 
            colResults[cellIdx][index] = result;
            if (!linesMap[`c${cellIdx}`]) {
                toCheck.push(["c", cellIdx]);
                linesMap[`c${cellIdx}`] = true;
            }
        } else {
            colResults[index][cellIdx] = result; 
            rowResults[cellIdx][index] = result; 
            if (!linesMap[`r${cellIdx}`]) {
                toCheck.push(["r", cellIdx]);
                linesMap[`r${cellIdx}`] = true;
            }
        }
        console.log("Updating row", line[1], "and column", index, "with result", result);
    }
    // Mark this line as processed
    linesMap[`${isRow ? "r" : "c"}${index}`] = false;
}

export const solve = async ({rows, columns}) => {
    let allLines = [];
    // First is designation, second is index
    for (let i = 0; i < rows.length; i++) allLines.push(["r", i]);
    for (let i = 0; i < columns.length; i++) allLines.push(["c", i]);

    // Initialize the queue with all lines
    const toCheck = [...allLines];
    // Map to track if lines are already in the queue
    const linesMap = {};
    for (let i = 0; i < allLines.length; i++) linesMap[allLines[i]] = true;

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
    let showAll = false;
    
    function handleShowSolution() {
        showAll = true;
    }

    while (toCheck.length > 0) {
        // Show the button only if not already skipping
        showResultsGrid(rowResults, popup, toCheck[0], !showAll, handleShowSolution);

        if (!showAll) {
            await waitForClick(popup);
        }

        if (showAll) {
            // Fast-forward: process all remaining lines without waiting or showing
            while (toCheck.length > 0) {
                const [type, idx] = toCheck.shift();
                processLine(type === "r" ? rowResults[idx] : colResults[idx], idx, type === "r", rowResults, colResults, rows, columns, linesMap, toCheck);
            }
            break;
        }

        console.log("Lines to check:", toCheck.length);
        // Check the first line in the queue
        const [type, idx] = toCheck.shift();
        processLine(type === "r" ? rowResults[idx] : colResults[idx], idx, type === "r", rowResults, colResults, rows, columns, linesMap, toCheck);

        // Show the current grid and wait for click to continue
        showResultsGrid(rowResults, popup, [type, idx]);
        await waitForClick(popup);
    }

    showResultsGrid(rowResults, popup, null, false);

};