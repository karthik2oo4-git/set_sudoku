import { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, Undo2, Redo2, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Cell = {
  value: string;
  isFixed: boolean;
  hint?: string;
  isValid?: boolean;
  setOperation?: string;
};

type GameHistory = {
  grid: Cell[][];
  score: number;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const GamePage = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(1000);
  const [timer, setTimer] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sets, setSets] = useState(() => generateRandomSets());

  function generateRandomSets() {
    const numbers = Array.from({ length: 9 }, (_, i) => (i + 1).toString());

    const shuffleArray = (array: string[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const shuffled = shuffleArray([...numbers]);

    const setA = new Set(shuffled.slice(0, 4));
    const setB = new Set([...shuffled.slice(2, 5)]);
    const setC = new Set([...shuffled.slice(3, 7)]);

    return {
      A: setA,
      B: setB,
      C: setC
    };
  }

  const getOperationsForDifficulty = (difficulty: Difficulty) => {
    const operations = {
      easy: ['A', 'B', 'C', 'A ∩ B', 'B ∩ C', 'A ∪ B'],
      medium: ['A', 'B', 'C', 'A ∩ B', 'B ∩ C', 'A ∪ B', 'B ∪ C', 'A - B', 'B - A'],
      hard: ['A', 'B', 'C', 'A ∩ B', 'B ∩ C', '(A ∩ B) - C', '(B ∩ C) - A', '(A ∪ B) - C', '(A - B) ∪ (B - C)']
    };
    return operations[difficulty];
  };

  useEffect(() => {
    initializeGrid();
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [difficulty]);

  const initializeGrid = () => {
    const newSets = generateRandomSets();
    setSets(newSets);
    setTimer(0);
    setScore(1000);

    const gridSize = 3; // All levels use 3x3 grid
    const operations = getOperationsForDifficulty(difficulty);

    const newGrid: Cell[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        value: '',
        isFixed: false,
        isValid: true,
        setOperation: '',
        hint: ''
      }))
    );

    // Randomly assign operations to cells and add fixed values
    const fixedCells = difficulty === 'easy' ? 2 : (difficulty === 'medium' ? 1 : 1);
    let fixedCount = 0;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const randomOp = operations[Math.floor(Math.random() * operations.length)];
        newGrid[i][j].setOperation = randomOp;
        newGrid[i][j].hint = `This element must satisfy: ${randomOp}`;

        if (fixedCount < fixedCells && !newGrid[i][j].isFixed) {
          const validNumbers = Array.from(newSets.A).filter(num =>
            newGrid[i][j].setOperation && validateSetOperation(num, newGrid[i][j].setOperation!)
          );
          if (validNumbers.length > 0) {
            const value = validNumbers[Math.floor(Math.random() * validNumbers.length)];
            newGrid[i][j] = {
              ...newGrid[i][j],
              value,
              isFixed: true,
              hint: `Fixed value: ${value}`
            };
            fixedCount++;
          }
        }
      }
    }

    setGrid(newGrid);
    setHistory([{ grid: newGrid, score: 1000 }]);
    setHistoryIndex(0);
  };

  const validateSetOperation = (value: string, operation: string): boolean => {
    const { A, B, C } = sets;
    switch (operation) {
      case 'A':
        return A.has(value);
      case 'B':
        return B.has(value);
      case 'C':
        return C.has(value);
      case 'A ∩ B':
        return A.has(value) && B.has(value);
      case 'A ∩ C':
        return A.has(value) && C.has(value);
      case 'B ∩ C':
        return B.has(value) && C.has(value);
      case 'A ∪ B':
        return A.has(value) || B.has(value);
      case 'B ∪ C':
        return B.has(value) || C.has(value);
      case 'A - B':
        return A.has(value) && !B.has(value);
      case 'B - A':
        return B.has(value) && !A.has(value);
      case '(A ∩ B) - C':
        return A.has(value) && B.has(value) && !C.has(value);
      case '(B ∩ C) - A':
        return B.has(value) && C.has(value) && !A.has(value);
      case '(A ∪ B) - C':
        return (A.has(value) || B.has(value)) && !C.has(value);
      case '(A - B) ∪ (B - C)':
        return (A.has(value) && !B.has(value)) || (B.has(value) && !C.has(value));
      default:
        return true;
    }
  };

  const validateCell = (row: number, col: number, value: string): boolean => {
    const cell = grid[row][col];
    if (!cell.setOperation) return true;

    const isOperationValid = validateSetOperation(value, cell.setOperation);
    const isUniqueInRow = grid[row]. every((c, i) => i === col || c.value !== value);
    const isUniqueInColumn = grid.every((r, i) => i === row || r[col].value !== value);

    return isOperationValid && isUniqueInRow && isUniqueInColumn;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!grid[row][col].isFixed) {
      setSelectedCell({ row, col });
      setShowHint(!!grid[row][col].hint);
    }
  };

  const handleSetSelection = (value: string) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      const isValid = validateCell(row, col, value);

      const newGrid = [...grid];
      newGrid[row][col] = {
        ...newGrid[row][col],
        value,
        isValid
      };

      setGrid(newGrid);

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ grid: newGrid, score });
      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);

      setSelectedCell(null);
      checkWinCondition();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setGrid(previousState.grid);
      setScore(previousState.score);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setGrid(nextState.grid);
      setScore(nextState.score);
    }
  };

  const checkWinCondition = () => {
    const isComplete = grid.every(row =>
      row.every(cell =>
        cell.value && (!cell.setOperation || cell.isValid)
      )
    );

  };

  const handleSubmit = async () => {
    const isComplete = grid.every((row) =>
      row.every((cell) => {
        if (!cell.value) return false; // Cell is empty
        if (cell.setOperation && !cell.isValid) return false; // Invalid set operation
        return true; // Cell is valid
      })
    );

    if (isComplete) {
      alert(`Congratulations! You've completed the puzzle with a score of ${score}!`);

      let playerName1 = localStorage.getItem('playerName');
      let password1 = localStorage.getItem('password');

      var uscore = score;
      var utimeTaken = 1000-uscore;

      try {
        const response = await fetch(`${import.meta.env.VITE_BCK_URL}/scores/update_user_score/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "playerName":playerName1,
            "password":password1,
            "score":uscore,
            "timeTaken":utimeTaken
          }),
        });

        if (response.ok) {
          await response.json();
          alert('Your score has been saved!');
        } else {
          alert('There was an error saving your score. Please try again later.');
        }
      } catch (error) {
        alert('An error occurred. Please check your connection and try again.');
      }
    } else {
      alert('The puzzle is not complete or contains invalid entries. Please check your answers.');
    }
    navigate('/main')
};

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/main')}
            className="flex items-center text-white hover:text-purple-300"
          >
            <ArrowLeft className="mr-2" /> Back to Main
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRules(!showRules)}
              className="flex items-center gap-2 text-white hover:text-purple-300"
            >
              <Info className="w-5 h-5" /> Rules
            </button>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="bg-white/10 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={() => initializeGrid()}
              className="flex items-center gap-2 text-white hover:text-purple-300"
            >
              <RefreshCw className="w-5 h-5" /> Reset
            </button>
          </div>
          <div className="text-white flex items-center gap-4">
            <span>Score: {score}</span>
            <span>Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {showRules && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">How to Play Set Sudoku</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Current Sets:</h3>
                  <p>A = {'{' + Array.from(sets.A).join(', ') + '}'}</p>
                  <p>B = {'{' + Array.from(sets.B).join(', ') + '}'}</p>
                  <p>C = {'{' + Array.from(sets.C).join(', ') + '}'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Rules:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Each cell must contain a number that satisfies its set operation</li>
                    <li>Numbers cannot repeat in the same row or column</li>
                    <li>Click a cell to select it, then use the number buttons to fill it</li>
                    <li>Red outline means the number doesn't satisfy the rules</li>
                    <li>Complete the grid with valid numbers to win</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold">Difficulty Levels:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Easy: Basic set operations (∩, ∪)</li>
                    <li>Medium: Adds set difference operations (-)</li>
                    <li>Hard: Complex combinations of operations</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-white mb-4 p-4 bg-black/20 rounded-lg">
            <h3 className="font-semibold mb-2">Current Sets:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>A = {'{' + Array.from(sets.A).join(', ') + '}'}</div>
              <div>B = {'{' + Array.from(sets.B).join(', ') + '}'}</div>
              <div>C = {'{' + Array.from(sets.C).join(', ') + '}'}</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 text-white hover:text-purple-300 disabled:opacity-50"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-white hover:text-purple-300 disabled:opacity-50"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
            {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={ `
                    aspect-square flex items-center justify-center rounded-lg text-2xl font-bold cursor-pointer
                    relative
                    ${cell.isFixed ? 'bg-purple-900 text-white' : 'bg-white/5 text-gray-200 hover:bg-white/20'}
                    ${cell.isValid === false ? 'ring-2 ring-red-500' : ''}
                    ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'ring-2 ring-purple-500' : ''}
                  `}
                >
                  {cell.value}
                  {cell.setOperation && (
                    <span className="absolute bottom-1 left-1 text-xs text-yellow-300">
                      {cell.setOperation}
                    </span>
                  )}
                  {cell.hint && (
                    <HelpCircle 
                      className="absolute top-1 right-1 w-4 h-4 text-yellow-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                    />
                  )}
                </div>
              ))
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Array.from(new Set([...sets.A, ...sets.B, ...sets.C])).sort().map(value => (
              <button
                key={value}
                onClick={() => handleSetSelection(value)}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xl font-semibold hover:from-purple-600 hover:to-pink-600 flex items-center justify-center"
              >
                {value}
              </button>
            ))}
          </div>

          {showHint && selectedCell && grid[selectedCell.row][selectedCell.col].hint && (
            <div className="text-center text-white bg-black/30 p-4 rounded-lg">
              <p className="mb-2">Hint: {grid[selectedCell.row][selectedCell.col].hint}</p>
              {grid[selectedCell.row][selectedCell.col].setOperation && (
                <p className="text-sm text-yellow-300">
                  Operation: {grid[selectedCell.row][selectedCell.col].setOperation}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg text-lg font-semibold hover:from-green-600 hover:to-blue-600 transition duration-300"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
