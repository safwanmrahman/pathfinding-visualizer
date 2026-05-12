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

export function NodeCell({ node, onMouseDown, onMouseEnter }) {
  return (
    <button
      type="button"
      className={getCellClasses(node)}
      onMouseDown={() => onMouseDown(node.row, node.col)}
      onMouseEnter={() => onMouseEnter(node.row, node.col)}
      aria-label={`Row ${node.row + 1}, column ${node.col + 1}`}
      role="gridcell"
      tabIndex={-1}
    />
  );
}
