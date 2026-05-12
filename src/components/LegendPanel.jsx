import { Legend } from './Legend';

export function LegendPanel() {
  return (
    <article className="panel-card utility-panel">
      <div className="panel-heading">
        <p className="panel-kicker">Legend</p>
        <h3>Read the board at a glance</h3>
      </div>

      <Legend />
    </article>
  );
}
