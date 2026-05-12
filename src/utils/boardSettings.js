import { algorithms } from '../algorithms';
import { MAZE_PATTERNS } from '../grid';

export function getBoardSettingsSnapshot({
  algorithmKey,
  playbackMode,
  allowDiagonal,
  mazePattern,
  speedMultiplier,
  selectedTool,
}) {
  return {
    algorithmKey,
    playbackMode,
    allowDiagonal,
    mazePattern,
    speedMultiplier,
    selectedTool,
  };
}

export function getValidatedBoardSettings(settings) {
  const safeSettings = settings && typeof settings === 'object' ? settings : {};

  return {
    algorithmKey:
      typeof safeSettings.algorithmKey === 'string' && algorithms[safeSettings.algorithmKey]
        ? safeSettings.algorithmKey
        : null,
    playbackMode:
      safeSettings.playbackMode === 'auto' || safeSettings.playbackMode === 'step'
        ? safeSettings.playbackMode
        : null,
    allowDiagonal:
      typeof safeSettings.allowDiagonal === 'boolean' ? safeSettings.allowDiagonal : null,
    mazePattern:
      typeof safeSettings.mazePattern === 'string' && MAZE_PATTERNS[safeSettings.mazePattern]
        ? safeSettings.mazePattern
        : null,
    speedMultiplier:
      typeof safeSettings.speedMultiplier === 'number' &&
      safeSettings.speedMultiplier >= 0.5 &&
      safeSettings.speedMultiplier <= 3
        ? safeSettings.speedMultiplier
        : null,
    selectedTool:
      safeSettings.selectedTool === 'wall' ||
      safeSettings.selectedTool === 'weight' ||
      safeSettings.selectedTool === 'erase'
        ? safeSettings.selectedTool
        : null,
  };
}
