import { useRef, useState } from 'react';
import { algorithms } from './algorithms';
import { INITIAL_STATUS_MESSAGE } from './constants';
import { AppHeader } from './components/AppHeader';
import { ControlsPanel } from './components/ControlsPanel';
import { GridBoard } from './components/GridBoard';
import { UtilitySidebar } from './components/UtilitySidebar';
import {
  DEFAULT_START,
  DEFAULT_TARGET,
  MAZE_PATTERNS,
  clearWalls,
  clearWeights,
  createGrid,
  generateMaze,
  importBoardState,
  serializeBoardState,
} from './grid';
import { useGridInteraction } from './hooks/useGridInteraction';
import { useVisualization } from './hooks/useVisualization';
import { getBoardSettingsSnapshot, getValidatedBoardSettings } from './utils/boardSettings';

function App() {
  const importInputRef = useRef(null);
  const [startNode, setStartNode] = useState(DEFAULT_START);
  const [targetNode, setTargetNode] = useState(DEFAULT_TARGET);
  const [grid, setGrid] = useState(() => createGrid(DEFAULT_START, DEFAULT_TARGET));
  const [algorithmKey, setAlgorithmKey] = useState('bfs');
  const [selectedTool, setSelectedTool] = useState('wall');
  const [playbackMode, setPlaybackMode] = useState('auto');
  const [allowDiagonal, setAllowDiagonal] = useState(false);
  const [mazePattern, setMazePattern] = useState('random');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [boardJson, setBoardJson] = useState('');
  const [statusMessage, setStatusMessage] = useState(INITIAL_STATUS_MESSAGE);
  const selectedAlgorithm = algorithms[algorithmKey];
  const algorithmOptions = Object.entries(algorithms);

  const {
    isAnimating,
    preparedRun,
    runStats,
    clearPath,
    stopVisualization,
    stepForward,
    visualizeAlgorithm,
    cancelVisualization,
    resetRunStats,
  } = useVisualization({
    grid,
    setGrid,
    startNode,
    targetNode,
    setStatusMessage,
    speedMultiplier,
  });

  function prepareBoardMutation({ resetStats = false } = {}) {
    cancelVisualization();

    if (resetStats) {
      resetRunStats();
    }
  }

  function resetBoard() {
    prepareBoardMutation({ resetStats: true });
    setGrid(createGrid(DEFAULT_START, DEFAULT_TARGET));
    setStartNode(DEFAULT_START);
    setTargetNode(DEFAULT_TARGET);
    setStatusMessage('Board reset to the default layout.');
  }

  function clearAllWalls() {
    prepareBoardMutation();
    setGrid((currentGrid) => clearWalls(currentGrid, startNode, targetNode));
    setStatusMessage('Removed all walls from the grid.');
  }

  function clearAllWeights() {
    prepareBoardMutation();
    setGrid((currentGrid) => clearWeights(currentGrid, startNode, targetNode));
    setStatusMessage('Removed all weighted nodes from the grid.');
  }

  function createMaze() {
    prepareBoardMutation();
    setGrid((currentGrid) => generateMaze(currentGrid, startNode, targetNode, mazePattern));
    setStatusMessage(`Generated the ${MAZE_PATTERNS[mazePattern].toLowerCase()} pattern.`);
  }

  function getBoardSettings() {
    return getBoardSettingsSnapshot({
      algorithmKey,
      playbackMode,
      allowDiagonal,
      mazePattern,
      speedMultiplier,
      selectedTool,
    });
  }

  function applyImportedBoard(nextBoard, sourceLabel) {
    prepareBoardMutation({ resetStats: true });
    setGrid(nextBoard.grid);
    setStartNode(nextBoard.start);
    setTargetNode(nextBoard.target);

    const nextSettings = getValidatedBoardSettings(nextBoard.settings);

    if (nextSettings.algorithmKey) {
      setAlgorithmKey(nextSettings.algorithmKey);
    }

    if (nextSettings.playbackMode) {
      setPlaybackMode(nextSettings.playbackMode);
    }

    if (nextSettings.allowDiagonal !== null) {
      setAllowDiagonal(nextSettings.allowDiagonal);
    }

    if (nextSettings.mazePattern) {
      setMazePattern(nextSettings.mazePattern);
    }

    if (nextSettings.speedMultiplier !== null) {
      setSpeedMultiplier(nextSettings.speedMultiplier);
    }

    if (nextSettings.selectedTool) {
      setSelectedTool(nextSettings.selectedTool);
    }

    setStatusMessage(`Imported board from ${sourceLabel}.`);
  }

  function exportBoard() {
    const nextBoardJson = serializeBoardState(grid, startNode, targetNode, getBoardSettings());
    setBoardJson(nextBoardJson);

    const file = new Blob([nextBoardJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pathfinding-board.json';
    link.click();
    window.URL.revokeObjectURL(url);

    setStatusMessage('Exported the current board as JSON and downloaded it.');
  }

  function importBoardFromText() {
    try {
      const nextBoard = importBoardState(boardJson);
      applyImportedBoard(nextBoard, 'the JSON editor');
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? `Import failed: ${error.message}` : 'Import failed: invalid board JSON.',
      );
    }
  }

  async function handleImportFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const fileContents = await file.text();
      setBoardJson(fileContents);
      const nextBoard = importBoardState(fileContents);
      applyImportedBoard(nextBoard, file.name);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? `Import failed: ${error.message}` : 'Import failed: invalid board JSON file.',
      );
    } finally {
      event.target.value = '';
    }
  }

  const { handleCellMouseDown, handleCellMouseEnter } = useGridInteraction({
    grid,
    isAnimating,
    selectedTool,
    startNode,
    targetNode,
    setGrid,
    setStartNode,
    setTargetNode,
    onBoardEdit: () => prepareBoardMutation(),
  });

  return (
    <div className="app-shell">
      <AppHeader allowDiagonal={allowDiagonal} selectedTool={selectedTool} />

      <main className="workspace">
        <ControlsPanel
          algorithmKey={algorithmKey}
          algorithmOptions={algorithmOptions}
          selectedAlgorithm={selectedAlgorithm}
          selectedTool={selectedTool}
          playbackMode={playbackMode}
          allowDiagonal={allowDiagonal}
          mazePattern={mazePattern}
          speedMultiplier={speedMultiplier}
          isAnimating={isAnimating}
          preparedRun={preparedRun}
          onAlgorithmChange={setAlgorithmKey}
          onSpeedChange={setSpeedMultiplier}
          onPlaybackModeChange={setPlaybackMode}
          onSelectedToolChange={setSelectedTool}
          onMazePatternChange={setMazePattern}
          onDiagonalChange={setAllowDiagonal}
          onVisualize={() => visualizeAlgorithm({ algorithmKey, playbackMode, allowDiagonal })}
          onStepForward={stepForward}
          onStop={stopVisualization}
          onClearPath={clearPath}
          onClearWalls={clearAllWalls}
          onClearWeights={clearAllWeights}
          onGenerateMaze={createMaze}
          onResetBoard={resetBoard}
        />

        <GridBoard
          grid={grid}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
        />

        <UtilitySidebar
          runStats={runStats}
          statusMessage={statusMessage}
          boardJson={boardJson}
          isAnimating={isAnimating}
          importInputRef={importInputRef}
          selectedAlgorithm={selectedAlgorithm}
          allowDiagonal={allowDiagonal}
          onBoardJsonChange={setBoardJson}
          onExportBoard={exportBoard}
          onImportBoardText={importBoardFromText}
          onOpenImportPicker={() => importInputRef.current?.click()}
          onImportFile={handleImportFileChange}
        />
      </main>
    </div>
  );
}

export default App;
