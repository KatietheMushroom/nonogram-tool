import React, { useEffect, useState } from 'react';
import { CanvasControls } from './Buttons';

const Canvas = ({ historyRef, setHistory, setRedoStack }) => {
    const [canvasWidth, setCanvasWidth] = useState(16);
    const [canvasHeight, setCanvasHeight] = useState(16);
    const [pixelSize, setPixelSize] = useState(30);

    const redrawCanvas = () => {
        const canvas = document.getElementById('canvas');
        const parent = canvas.parentElement;
        const controls = document.querySelector('.canvas-controls');
        canvas.innerHTML = ''; // Clear the canvas before updating
        let isMouseDown = false;
        let isErasing = false;
        let dragChanges = [];
        
        // Calculate available space in the parent div
        const parentRect = parent.getBoundingClientRect();
        const controlsRect = controls.getBoundingClientRect();
        const availableWidth = parentRect.width;
        const availableHeight = parentRect.height - controlsRect.height - 40;

        // Dynamically calculate pixel size to fit within the parent div
        const newPixelSize = Math.min(
            availableWidth / canvasWidth,
            availableHeight / canvasHeight
        );
        
        // Set canvas dimensions dynamically
        canvas.style.setProperty('--canvas-width', canvasWidth);
        canvas.style.setProperty('--canvas-height', canvasHeight);

        const createPixel = () => {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.width = `${newPixelSize}px`;
            pixel.style.height = `${newPixelSize}px`;

            pixel.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isMouseDown = true;
                isErasing = pixel.classList.contains('filled');
                pixel.classList.toggle('filled');
                dragChanges.push({ pixel, wasFilled: isErasing });
            });

            pixel.addEventListener('mouseover', () => {
                if (isMouseDown) {
                    const wasFilled = pixel.classList.contains('filled');
                    if (isErasing) {
                        pixel.classList.remove('filled');
                    } else {
                        pixel.classList.add('filled');
                    }

                    const existingChange = dragChanges.find((change) => change.pixel === pixel);
                    if (!existingChange) {
                        dragChanges.push({ pixel, wasFilled });
                    }
                }
            });

            return pixel;
        };

        if (canvas.children.length === 0) {
            for (let row = 0; row < canvasHeight; row++) {
                for (let col = 0; col < canvasWidth; col++) {
                    const pixel = createPixel();
                    canvas.appendChild(pixel);
                }
            }
        }

        // Prevent default right-click menu
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        document.addEventListener('mouseup', () => {
            if (dragChanges.length > 0) {
                const updatedHistory = [...historyRef.current, dragChanges];
                historyRef.current = updatedHistory;
                setHistory(updatedHistory);
                setRedoStack([]);
            }
            dragChanges = [];
            isMouseDown = false;
            isErasing = false;
        });

        canvas.addEventListener('mouseleave', () => {
            isMouseDown = false;
            isErasing = false;
        });
    };
    
    useEffect(() => {
        redrawCanvas(); // Initial render
    }, []);

    const handleUpdateCanvas = () => {
        setHistory([]); // Reset history
        setRedoStack([]); // Reset redo stack
        redrawCanvas(); // Redraw the canvas
    };

    return (
        <div className="content">
            <CanvasControls
                canvasWidth={canvasWidth}
                setCanvasWidth={setCanvasWidth}
                canvasHeight={canvasHeight}
                setCanvasHeight={setCanvasHeight}
                handleUpdateCanvas={handleUpdateCanvas}
            />
            <div className="canvas" id="canvas"></div>
        </div>
    );
};

export default Canvas;