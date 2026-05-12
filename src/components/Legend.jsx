import { WEIGHTED_NODE_COST } from '../grid';

const legendItems = [
  { key: 'start', label: 'Start' },
  { key: 'target', label: 'Target' },
  { key: 'wall', label: 'Wall' },
  { key: 'weight', label: `Weight ${WEIGHTED_NODE_COST}` },
  { key: 'visited', label: 'Visited' },
  { key: 'path', label: 'Final Path' },
];

export function Legend() {
  return (
    <div className="legend" aria-label="Grid legend">
      {legendItems.map((item) => (
        <div key={item.key} className="legend-item">
          <span className={`legend-swatch ${item.key}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
