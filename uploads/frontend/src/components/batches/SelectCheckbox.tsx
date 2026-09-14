import { Checkbox } from "@/components/ds";

interface SelectCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}

/**
 * Keyboard- and screen-reader-accessible wrapper around the design system's
 * `Checkbox`.
 *
 * The shared DS component is a styled `<label>`/`<span>` pair with no native
 * control, so it is not focusable and exposes no checkbox role. Rather than
 * fork the copied design system, this wraps it: a real `<input type="checkbox">`
 * carries the semantics, focus, and keyboard behaviour, and the DS element
 * provides the visuals as decoration.
 */
export function SelectCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
}: SelectCheckboxProps) {
  return (
    <label
      style={{
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        position: "relative",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={() => {
          if (!disabled) onChange();
        }}
        ref={(node) => {
          if (node) node.indeterminate = indeterminate && !checked;
        }}
        style={{
          cursor: "inherit",
          height: 18,
          margin: 0,
          opacity: 0,
          position: "absolute",
          width: 18,
        }}
      />
      <span aria-hidden="true">
        <Checkbox checked={checked} indeterminate={indeterminate} disabled={disabled} />
      </span>
    </label>
  );
}
