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
    return (
        <button className="export-button">
            Export 
        </button>
    );
};