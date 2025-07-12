import React, { useEffect } from 'react';

const Canvas = ({ historyRef, setHistory, setRedoStack }) => {
    useEffect(() => {
        const canvas = document.getElementById('canvas');
        let isMouseDown = false;
        let isErasing = false;
        let dragChanges = [];
        
        const createPixel = () => {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';

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
            for (let i = 0; i < 256; i++) {
                const pixel = createPixel();
                canvas.appendChild(pixel);
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
    }, [historyRef, setHistory, setRedoStack]);

    return <div className="canvas" id="canvas"></div>;
};

export default Canvas;