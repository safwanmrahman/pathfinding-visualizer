import { WEIGHTED_NODE_COST } from '../grid';

export function LearningPanel({ selectedAlgorithm, allowDiagonal }) {
  return (
    <article className="panel-card utility-panel">
      <div className="panel-heading">
        <p className="panel-kicker">Learning Notes</p>
        <h3>What to pay attention to</h3>
      </div>

      <div className="learning-list">
        <p>
          <strong>{selectedAlgorithm.label}</strong> {selectedAlgorithm.summary}
        </p>
        <p>
          Weighted nodes cost <strong>{WEIGHTED_NODE_COST}</strong>. BFS and DFS ignore the extra
          cost, while Dijkstra and A* use it to compare routes.
        </p>
        <p>
          Movement mode:{' '}
          <strong>{allowDiagonal ? '8-directional with blocked-corner rules' : '4-directional only'}</strong>.
        </p>
      </div>
    </article>
  );
}
