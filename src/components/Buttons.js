import React from 'react';

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
        const gridSize = Math.sqrt(pixels.length); // Assuming a square grid
        const pixelSize = pixels[0].offsetWidth; // Get the size of a single pixel

        // Set canvas dimensions
        canvasElement.width = gridSize * pixelSize;
        canvasElement.height = gridSize * pixelSize;

        const ctx = canvasElement.getContext('2d');

        // Draw each pixel onto the canvas
        pixels.forEach((pixel, index) => {
            const x = (index % gridSize) * pixelSize;
            const y = Math.floor(index / gridSize) * pixelSize;

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