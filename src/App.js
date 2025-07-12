import React, { useState, useRef } from 'react';
import './App.css'
import Canvas from './components/Canvas';
import { undo, redo } from './components/UndoRedoManager';
import { ClearButton, CheckButton, ExportButton } from './components/Buttons';

function App() {
    const [history, setHistory] = useState([]); // History stack for undo/redo
    const [redoStack, setRedoStack] = useState([]); // Redo stack
    const historyRef = useRef(history);
    const redoStackRef = useRef(redoStack);

    // Add keyboard event listeners for undo and redo
    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo(historyRef, setHistory, setRedoStack);
        } else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo(redoStackRef, setRedoStack, setHistory);
        }
    };

    React.useEffect(() => {
        historyRef.current = history;
        redoStackRef.current = redoStack;
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [history, redoStack]);

    return (
        <div className="App">
            <div className="card">
                <h1>Nonogram Studio</h1>
                <Canvas historyRef={historyRef} setHistory={setHistory} setRedoStack={setRedoStack} />
                <div className="bottom-toolbar">
                    <ClearButton setHistory={setHistory} setRedoStack={setRedoStack} />
                    <CheckButton/>
                    <ExportButton/>
                </div>
            </div>
        </div>
    );
}

export default App;
