function checkLine(line, clues) {
    // Returns an array with the indices of squares that were changed
    // and their new values as pairs of {index, result}
    const changedSquares = [];
    console.log("Clues:", clues);

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
        // Try superimposing 
        const lineLeft = Array(line.length).fill(0);
        const lineRight = Array(line.length).fill(0);
        let leftCount = 0;
        let rightCount = 0;
        for (let i = 0; i < clues.length; i++) {
            // Fill in one left clue
            const clueLeft = clues[i];
            for (let j = 0; j < clueLeft; j++) {
                lineLeft[i+leftCount] = 2;
                leftCount++;
            }
            lineLeft[i+leftCount] = 1; 
            leftCount++;
            // Fill in one right clue
            const clueRight = clues[clues.length - i - 1];
            for (let j = 0; j < clueRight; j++) {
                lineRight[line.length - 1 - i - rightCount] = 2;
                rightCount++;
            }
            lineRight[line.length - 1 - i - rightCount] = 1; 
            rightCount++;
        }
        // Now superimpose the two lines
        for (let i = 0; i < line.length; i++) {
            if (lineLeft[i] === 2 && lineRight[i] === 2) {
                // If both are filled, fill it
                if (line[i] !== 2) {
                    changedSquares.push({ index: i, result: 2 });
                }
            }
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

export const solve = ({rows, columns}) => {
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
        }
        // Update linesMap to say this line is no longer in the queue
        linesMap[`${line[0]}${line[1]}`] = false;
    }

    showResultsGrid(rowResults);

};