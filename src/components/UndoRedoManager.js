export const undo = (historyRef, setHistory, setRedoStack) => {
	if (historyRef.current.length > 0) {
		const newHistory = [...historyRef.current];
		const lastAction = newHistory.pop();

		if (!lastAction || lastAction.length === 0) {
			console.error('Undo action is empty or undefined:', lastAction);
			return;
		}

		setHistory(newHistory);
		setRedoStack((prevRedoStack) => [lastAction, ...prevRedoStack]);

		lastAction.forEach(({ pixel, wasFilled }) => {
			if (pixel) {
				if (wasFilled) {
					pixel.classList.add('filled');
				} else {
					pixel.classList.remove('filled');
				}
			} else {
				console.error('Pixel is undefined in undo action:', lastAction);
			}
		});
	}
};

export const redo = (redoStackRef, setRedoStack, setHistory) => {
	if (redoStackRef.current.length > 0) {
		const newRedoStack = [...redoStackRef.current];
		const lastRedo = newRedoStack.shift();

		if (!lastRedo || lastRedo.length === 0) {
			console.error('Redo action is empty or undefined:', lastRedo);
			return;
		}

		setRedoStack(newRedoStack);
		setHistory((prevHistory) => [...prevHistory, lastRedo]);

		lastRedo.forEach(({ pixel, wasFilled }) => {
			if (pixel) {
				if (wasFilled) {
					pixel.classList.remove('filled');
				} else {
					pixel.classList.add('filled');
				}
			} else {
				console.error('Pixel is undefined in redo action:', lastRedo);
			}
		});
	}
};