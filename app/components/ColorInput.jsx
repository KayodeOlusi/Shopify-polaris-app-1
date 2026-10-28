const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Polaris' s-color-field popover was too heavy for two colours, so we pair the
// browser's colour picker with a hex text field that stays in sync with it.
export function ColorInput({ label, name, value, error, onChange }) {
  const swatchValue = HEX_COLOR.test(value) ? value : "#000000";

  return (
    <div className="color-input">
      <input
        type="color"
        className="color-input__swatch"
        aria-label={`${label} picker`}
        value={swatchValue}
        onChange={(e) => onChange(e.target.value)}
      />
      <s-text-field
        label={label}
        name={name}
        value={value}
        maxLength={7}
        autocomplete="off"
        error={error}
        onInput={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}
