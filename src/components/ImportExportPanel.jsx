export function ImportExportPanel({
  boardJson,
  isAnimating,
  importInputRef,
  onBoardJsonChange,
  onExport,
  onImportText,
  onOpenFilePicker,
  onImportFile,
}) {
  return (
    <article className="panel-card import-export-panel">
      <div className="panel-heading">
        <p className="panel-kicker">Import / Export</p>
        <h3>Save a scenario or load one back in</h3>
      </div>

      <label className="field import-export-field">
        <span>Board JSON</span>
        <textarea
          className="board-json-input"
          value={boardJson}
          onChange={(event) => onBoardJsonChange(event.target.value)}
          placeholder="Export the current board, or paste a saved board JSON here to import it."
          spellCheck="false"
        />
      </label>

      <div className="import-export-actions">
        <button type="button" className="button-secondary" onClick={onExport} disabled={isAnimating}>
          Export Board
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={onImportText}
          disabled={isAnimating || !boardJson.trim()}
        >
          Import JSON
        </button>
        <button type="button" className="button-secondary" onClick={onOpenFilePicker} disabled={isAnimating}>
          Upload JSON
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={onImportFile}
        />
      </div>
    </article>
  );
}
