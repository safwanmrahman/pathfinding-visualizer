export function AlgorithmSelector({ algorithmKey, algorithmOptions, disabled, onChange }) {
  return (
    <label className="field">
      <span>Algorithm</span>
      <select value={algorithmKey} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {algorithmOptions.map(([key, option]) => (
          <option key={key} value={key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
