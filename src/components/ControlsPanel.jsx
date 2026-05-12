import { DRAW_TOOLS, PLAYBACK_MODES } from '../constants';
import { MAZE_PATTERNS } from '../grid';
import { AlgorithmSelector } from './AlgorithmSelector';

function ActionButton({ children, variant = 'primary', disabled = false, onClick }) {
  const className = variant === 'secondary' ? 'button-secondary' : 'button-primary';

  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function SectionBlock({ kicker, title, children, className = '' }) {
  return (
    <div className={`section-block ${className}`.trim()}>
      <div className="section-block-header">
        <p className="panel-kicker">{kicker}</p>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ControlsPanel({
  algorithmKey,
  algorithmOptions,
  selectedAlgorithm,
  selectedTool,
  playbackMode,
  allowDiagonal,
  mazePattern,
  speedMultiplier,
  isAnimating,
  preparedRun,
  onAlgorithmChange,
  onSpeedChange,
  onPlaybackModeChange,
  onSelectedToolChange,
  onMazePatternChange,
  onDiagonalChange,
  onVisualize,
  onStepForward,
  onStop,
  onClearPath,
  onClearWalls,
  onClearWeights,
  onGenerateMaze,
  onResetBoard,
}) {
  return (
    <section className="workspace-panel controls-panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Control Center</p>
          <h2>Set the board up, then run the search.</h2>
        </div>
        <p className="panel-description">Keep the most-used inputs close to the grid.</p>
      </div>

      <div className="controls-layout">
        <article className="panel-card grouped-card">
          <SectionBlock kicker="Algorithm" title="Pick the strategy you want to compare">
            <div className="stack stack-tight">
              <AlgorithmSelector
                algorithmKey={algorithmKey}
                algorithmOptions={algorithmOptions}
                disabled={isAnimating}
                onChange={onAlgorithmChange}
              />

              <div className="algorithm-spotlight">
                <p className="spotlight-title">{selectedAlgorithm.label}</p>
                <p className="spotlight-copy">{selectedAlgorithm.summary}</p>
              </div>

              <dl className="complexity-list">
                <div>
                  <dt>Shortest</dt>
                  <dd>{selectedAlgorithm.shortestPathGuarantee}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{selectedAlgorithm.timeComplexity}</dd>
                </div>
                <div>
                  <dt>Space</dt>
                  <dd>{selectedAlgorithm.spaceComplexity}</dd>
                </div>
              </dl>
            </div>
          </SectionBlock>
        </article>

        <article className="panel-card grouped-card">
          <SectionBlock kicker="Run Actions" title="Animate, inspect, and reset quickly">
            <div className="action-grid">
              <ActionButton disabled={isAnimating} onClick={onVisualize}>
                {isAnimating ? 'Visualizing...' : playbackMode === 'step' ? 'Prepare Steps' : 'Visualize'}
              </ActionButton>
              <ActionButton variant="secondary" disabled={isAnimating || !preparedRun} onClick={onStepForward}>
                Step Forward
              </ActionButton>
              <ActionButton variant="secondary" disabled={!isAnimating && !preparedRun} onClick={onStop}>
                Stop
              </ActionButton>
              <ActionButton variant="secondary" onClick={onResetBoard}>
                Reset Board
              </ActionButton>
            </div>
          </SectionBlock>
        </article>

        <article className="panel-card grouped-card">
          <SectionBlock kicker="Primary Tools" title="Control drawing, movement, and playback">
            <div className="stack stack-tight">
              <label className="field field-range">
                <span>Animation Speed: {speedMultiplier.toFixed(1)}x</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={speedMultiplier}
                  onChange={(event) => onSpeedChange(Number(event.target.value))}
                  disabled={isAnimating}
                />
              </label>

              <div className="responsive-fields responsive-fields-compact">
                <label className="field">
                  <span>Playback</span>
                  <select
                    value={playbackMode}
                    onChange={(event) => onPlaybackModeChange(event.target.value)}
                    disabled={isAnimating}
                  >
                    {Object.entries(PLAYBACK_MODES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="tool-selector" role="group" aria-label="Draw tool">
                {Object.entries(DRAW_TOOLS).map(([key, option]) => (
                  <button
                    key={key}
                    type="button"
                    className={`tool-chip ${selectedTool === key ? 'is-selected' : ''}`}
                    onClick={() => onSelectedToolChange(key)}
                    disabled={isAnimating}
                    aria-pressed={selectedTool === key}
                  >
                    <span className="tool-chip-title">{option.label}</span>
                    <span className="tool-chip-copy">{option.helperText}</span>
                  </button>
                ))}
              </div>

              <label className="toggle-field" aria-label="Allow diagonal movement">
                <input
                  type="checkbox"
                  checked={allowDiagonal}
                  onChange={(event) => onDiagonalChange(event.target.checked)}
                  disabled={isAnimating}
                />
                <span>{allowDiagonal ? 'Diagonal movement is enabled' : 'Use 4-directional movement only'}</span>
              </label>
            </div>
          </SectionBlock>

          <SectionBlock kicker="Board Actions" title="Scenario generation and cleanup" className="section-block-compact">
            <div className="stack stack-tight">
              <div className="responsive-fields responsive-fields-compact">
                <label className="field">
                  <span>Maze Pattern</span>
                  <select
                    value={mazePattern}
                    onChange={(event) => onMazePatternChange(event.target.value)}
                    disabled={isAnimating}
                  >
                    {Object.entries(MAZE_PATTERNS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="action-grid action-grid-secondary">
                <ActionButton variant="secondary" onClick={onClearPath}>
                  Clear Path
                </ActionButton>
                <ActionButton variant="secondary" onClick={onClearWalls}>
                  Clear Walls
                </ActionButton>
                <ActionButton variant="secondary" onClick={onClearWeights}>
                  Clear Weights
                </ActionButton>
                <ActionButton variant="secondary" disabled={isAnimating} onClick={onGenerateMaze}>
                  Generate Maze
                </ActionButton>
              </div>
            </div>
          </SectionBlock>
        </article>
      </div>
    </section>
  );
}
