import React from 'react';

export const generateNonogramClues = () => {
    const pixels = document.querySelectorAll('.pixel');

    // Get canvas dimensions from canvas controls
    const canvasControls = document.querySelector('.canvas-controls');
    const inputs = canvasControls.querySelectorAll('input[type="number"]');
    const widthInput = inputs[0]; 
    const heightInput = inputs[1]; 
    const canvasWidth = parseInt(widthInput.value, 10);
    const canvasHeight = parseInt(heightInput.value, 10);

    const rows = [];
    const columns = Array.from({ length: canvasWidth }, () => []);

    // Generate row clues
    for (let row = 0; row < canvasHeight; row++) {
        const rowClues = [];
        let count = 0;

        for (let col = 0; col < canvasWidth; col++) {
            const index = row * canvasWidth + col;
            if (pixels[index].classList.contains('filled')) {
                count++;
            } else if (count > 0) {
                rowClues.push(count);
                count = 0;
            }
        }

        if (count > 0) {
            rowClues.push(count);
        }

        rows.push(rowClues.length > 0 ? rowClues : [0]);
    }

    // Generate column clues
    for (let col = 0; col < canvasWidth; col++) {
        const colClues = [];
        let count = 0;

        for (let row = 0; row < canvasHeight; row++) {
            const index = row * canvasWidth + col;
            if (pixels[index].classList.contains('filled')) {
                count++;
            } else if (count > 0) {
                colClues.push(count);
                count = 0;
            }
        }

        if (count > 0) {
            colClues.push(count);
        }

        columns[col] = colClues.length > 0 ? colClues : [0];
    }

    return { rows, columns };
};

export const ClearButton = ({ setHistory, setRedoStack }) => {
    const clearCanvas = () => {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach((pixel) => {
            pixel.classList.remove('filled');
        });
        setHistory([]);
        setRedoStack([]);
    };

    return (
        <button onClick={clearCanvas} className="clear-button">
            Clear Canvas
        </button>
    );
};

export const CheckButton = () => {
    return (
        <button className="check-button">
            Solve Nonogram
        </button>
    );
};

export const ExportButton = () => {
    const exportCanvasAsPNG = () => {
        const canvasElement = document.createElement('canvas');
        const pixels = document.querySelectorAll('.pixel');
        const pixelSize = pixels[0].offsetWidth;

        const canvasControls = document.querySelector('.canvas-controls');
        const inputs = canvasControls.querySelectorAll('input[type="number"]');
        const widthInput = inputs[0]; 
        const heightInput = inputs[1]; 
        const canvasWidth = parseInt(widthInput.value, 10);
        const canvasHeight = parseInt(heightInput.value, 10);

        // Set canvas dimensions
        canvasElement.width = canvasWidth * pixelSize;
        canvasElement.height = canvasHeight * pixelSize;

        const ctx = canvasElement.getContext('2d');

        // Draw each pixel onto the canvas
        pixels.forEach((pixel, index) => {
            const x = (index % canvasWidth) * pixelSize;
            const y = Math.floor(index / canvasWidth) * pixelSize;

            if (pixel.classList.contains('filled')) {
                ctx.fillStyle = 'black'; // Filled pixels are black
            } else {
                ctx.fillStyle = 'white'; // Empty pixels are white
            }

            ctx.fillRect(x, y, pixelSize, pixelSize);
        });

        // Convert canvas to PNG and trigger download
        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvasElement.toDataURL('image/png');
        link.click();
    };

    return (
        <button onClick={exportCanvasAsPNG} className="export-button">
            Export as PNG
        </button>
    );
};

export const ExportPuzzleButton = () => {
    const exportPuzzleAsPNG = () => {
        const { rows, columns } = generateNonogramClues();
        const pixels = document.querySelectorAll('.pixel');
        const pixelSize = pixels[0].offsetWidth; 

        const canvasControls = document.querySelector('.canvas-controls');
        const inputs = canvasControls.querySelectorAll('input[type="number"]');
        const widthInput = inputs[0]; 
        const heightInput = inputs[1]; 
        const canvasWidth = parseInt(widthInput.value, 10);
        const canvasHeight = parseInt(heightInput.value, 10);
        
        // Dynamically adjust clueSize based on the maximum number of clues
        const maxRowClues = Math.max(...rows.map((row) => row.length));
        const maxColClues = Math.max(...columns.map((col) => col.length));
        const clueSize = Math.max(maxRowClues, maxColClues) * pixelSize;

        // Set canvas dimensions
        const canvasElement = document.createElement('canvas');
        canvasElement.width = canvasWidth * pixelSize + clueSize;
        canvasElement.height = canvasHeight * pixelSize + clueSize;

        const ctx = canvasElement.getContext('2d');

        // Normalize row clues (fill shorter rows with empty squares)
        const normalizedRows = rows.map((rowClues) => {
            const paddedRow = [...rowClues];
            while (paddedRow.length < maxRowClues) {
                paddedRow.unshift(0); // Add empty squares at the beginning
            }
            return paddedRow;
        });

        // Draw clues for rows (horizontally)
        normalizedRows.forEach((rowClues, rowIndex) => {
            rowClues.forEach((clue, clueIndex) => {
                const x = clueSize - pixelSize * (rowClues.length - clueIndex); 
                const y = clueSize + rowIndex * pixelSize; 

                // Draw white square background for the clue
                ctx.fillStyle = 'white';
                ctx.fillRect(x, y, pixelSize, pixelSize);

                // Draw gridlines around the clue
                ctx.strokeStyle = '#ddd'; // Light gray gridlines
                ctx.strokeRect(x, y, pixelSize, pixelSize);

                // Draw the clue text
                if (clue > 0) {
                    ctx.font = `${pixelSize * 0.6}px monospace`; 
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(clue, x + pixelSize / 2, y + pixelSize / 2);
                }
            });
        });

        // Normalize column clues (fill shorter columns with empty squares)
        const normalizedColumns = columns.map((colClues) => {
            const paddedColumn = [...colClues];
            while (paddedColumn.length < maxColClues) {
                paddedColumn.unshift(0); // Add empty squares at the beginning
            }
            return paddedColumn;
        });

        // Draw clues for columns (stacked vertically)
        normalizedColumns.forEach((colClues, colIndex) => {
            colClues.forEach((clue, clueIndex) => {
                const x = clueSize + colIndex * pixelSize;
                const y = clueSize - pixelSize * (colClues.length - clueIndex);

                // Draw white square background for the clue
                ctx.fillStyle = 'white';
                ctx.fillRect(x, y, pixelSize, pixelSize);

                // Draw gridlines around the clue
                ctx.strokeStyle = '#ddd'; // Light gray gridlines
                ctx.strokeRect(x, y, pixelSize, pixelSize);

                // Draw the clue text
                if (clue > 0) {
                    ctx.font = `${pixelSize * 0.6}px monospace`; 
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(clue, x + pixelSize / 2, y + pixelSize / 2);
                }
            });
        });

        // Draw each pixel onto the canvas
        pixels.forEach((pixel, index) => {
            const x = clueSize + (index % canvasWidth) * pixelSize;
            const y = clueSize + Math.floor(index / canvasWidth) * pixelSize;
            ctx.fillStyle = 'white'; 
            ctx.fillRect(x, y, pixelSize, pixelSize);
            ctx.strokeStyle = '#ddd'; // Add gridlines
            ctx.strokeRect(x, y, pixelSize, pixelSize);
        });

        // Draw a border around the grid area (excluding clues)
        ctx.strokeStyle = '#888'; 
        ctx.lineWidth = 2; 
        ctx.strokeRect(clueSize, clueSize, canvasWidth * pixelSize, canvasHeight * pixelSize);

        // Convert canvas to PNG and trigger download
        const link = document.createElement('a');
        link.download = 'nonogram-puzzle.png';
        link.href = canvasElement.toDataURL('image/png');
        link.click();
    };

    return (
        <button onClick={exportPuzzleAsPNG} className="export-puzzle-button">
            Export as Puzzle
        </button>
    );
};

export const CanvasControls = ({ canvasWidth, setCanvasWidth, canvasHeight, setCanvasHeight, handleUpdateCanvas }) => {
    return (
        <div className="canvas-controls">
            <label>
                Width:
                <input
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(Number(e.target.value))}
                    min="1"
                />
            </label>
            <label>
                Height:
                <input
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Number(e.target.value))}
                    min="1"
                />
            </label>
            <button onClick={handleUpdateCanvas}>Update Canvas</button>
        </div>
    );
};