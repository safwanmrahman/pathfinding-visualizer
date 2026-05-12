import { useCallback, useEffect, useState } from 'react';
import { moveSpecialNode, resetSearchState, updateNodeType } from '../grid';

function getNextToolType(selectedTool, node) {
  if (selectedTool === 'erase') {
    return 'empty';
  }

  if (selectedTool === 'weight') {
    return node.isWeighted ? 'empty' : 'weight';
  }

  return node.isWall ? 'empty' : 'wall';
}

export function useGridInteraction({
  grid,
  isAnimating,
  selectedTool,
  startNode,
  targetNode,
  setGrid,
  setStartNode,
  setTargetNode,
  onBoardEdit,
}) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragMode, setDragMode] = useState(null);

  useEffect(() => {
    function handleMouseUp() {
      setIsMouseDown(false);
      setDragMode(null);
    }

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleCellMouseDown = useCallback((row, col) => {
    if (isAnimating) {
      return;
    }

    const node = grid[row][col];
    setIsMouseDown(true);

    if (node.isStart) {
      onBoardEdit();
      setDragMode('move-start');
      return;
    }

    if (node.isTarget) {
      onBoardEdit();
      setDragMode('move-target');
      return;
    }

    const nextType = getNextToolType(selectedTool, node);
    onBoardEdit();
    setDragMode(nextType);
    setGrid((currentGrid) => updateNodeType(resetSearchState(currentGrid), row, col, nextType));
  }, [grid, isAnimating, onBoardEdit, selectedTool, setGrid]);

  const handleCellMouseEnter = useCallback((row, col) => {
    if (!isMouseDown || isAnimating || !dragMode) {
      return;
    }

    const node = grid[row][col];

    if (dragMode === 'move-start') {
      if (node.isTarget) {
        return;
      }

      setGrid((currentGrid) => moveSpecialNode(currentGrid, startNode, { row, col }, 'isStart'));
      setStartNode({ row, col });
      return;
    }

    if (dragMode === 'move-target') {
      if (node.isStart) {
        return;
      }

      setGrid((currentGrid) => moveSpecialNode(currentGrid, targetNode, { row, col }, 'isTarget'));
      setTargetNode({ row, col });
      return;
    }

    if (node.isStart || node.isTarget) {
      return;
    }

    if (dragMode === 'wall' && node.isWall) {
      return;
    }

    if (dragMode === 'weight' && node.isWeighted) {
      return;
    }

    if (dragMode === 'empty' && !node.isWall && !node.isWeighted) {
      return;
    }

    setGrid((currentGrid) => updateNodeType(resetSearchState(currentGrid), row, col, dragMode));
  }, [
    dragMode,
    grid,
    isAnimating,
    isMouseDown,
    setGrid,
    setStartNode,
    setTargetNode,
    startNode,
    targetNode,
  ]);

  return {
    handleCellMouseDown,
    handleCellMouseEnter,
  };
}
