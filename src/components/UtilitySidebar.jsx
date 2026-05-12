import { ImportExportPanel } from './ImportExportPanel';
import { LearningPanel } from './LearningPanel';
import { LegendPanel } from './LegendPanel';
import { StatsPanel } from './StatsPanel';
import { StatusPanel } from './StatusPanel';

export function UtilitySidebar({
  runStats,
  statusMessage,
  boardJson,
  isAnimating,
  importInputRef,
  selectedAlgorithm,
  allowDiagonal,
  onBoardJsonChange,
  onExportBoard,
  onImportBoardText,
  onOpenImportPicker,
  onImportFile,
}) {
  return (
    <aside className="workspace-panel utility-sidebar">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Utility Rail</p>
          <h2>Reference, progress, and saved boards</h2>
        </div>
        <p className="panel-description">Keep stats, notes, status, and board snapshots close without crowding the grid.</p>
      </div>

      <div className="utility-stack">
        <StatsPanel runStats={runStats} />
        <LearningPanel selectedAlgorithm={selectedAlgorithm} allowDiagonal={allowDiagonal} />
        <LegendPanel />
        <StatusPanel statusMessage={statusMessage} />
        <ImportExportPanel
          boardJson={boardJson}
          isAnimating={isAnimating}
          importInputRef={importInputRef}
          onBoardJsonChange={onBoardJsonChange}
          onExport={onExportBoard}
          onImportText={onImportBoardText}
          onOpenFilePicker={onOpenImportPicker}
          onImportFile={onImportFile}
        />
      </div>
    </aside>
  );
}
