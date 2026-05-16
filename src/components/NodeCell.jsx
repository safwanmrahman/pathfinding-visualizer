import { memo } from 'react';

function getCellClasses(node) {
  return [
    'cell',
    node.isStart ? 'cell-start' : '',
    node.isTarget ? 'cell-target' : '',
    node.isWall ? 'cell-wall' : '',
    node.isWeighted ? 'cell-weight' : '',
    node.isVisited ? 'cell-visited' : '',
    node.isPath ? 'cell-path' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function getCellLabel(node) {
  const states = [];

  if (node.isStart) states.push('start node');
  if (node.isTarget) states.push('target node');
  if (node.isWall) states.push('wall');
  if (node.isWeighted) states.push(`weighted node with cost ${node.weight}`);
  if (node.isVisited) states.push('visited');
  if (node.isPath) states.push('final path');

  const stateLabel = states.length > 0 ? `, ${states.join(', ')}` : '';
  return `Row ${node.row + 1}, column ${node.col + 1}${stateLabel}`;
}

function NodeCellComponent({ node, onMouseDown, onMouseEnter }) {
  return (
    <button
      type="button"
      className={getCellClasses(node)}
      onPointerDown={() => onMouseDown(node.row, node.col)}
      onPointerEnter={() => onMouseEnter(node.row, node.col)}
      aria-label={getCellLabel(node)}
      role="gridcell"
      tabIndex={-1}
    />
  );
}

export const NodeCell = memo(NodeCellComponent, (previousProps, nextProps) => {
  return (
    previousProps.node === nextProps.node &&
    previousProps.onMouseDown === nextProps.onMouseDown &&
    previousProps.onMouseEnter === nextProps.onMouseEnter
  );
});
