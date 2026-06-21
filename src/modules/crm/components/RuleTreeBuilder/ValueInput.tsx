/**
 * Smart value input — renders the appropriate control based on field type + op.
 * NULL_OPS render nothing. ARRAY_OPS render a comma-split textarea.
 * Boolean renders Yes/No. Date renders a date picker. Numbers are numeric inputs.
 */

import { type FieldType } from "../../lib/rule-tree";
import { NULL_OPS, ARRAY_OPS } from "./builder-types";

interface Props {
  fieldType: FieldType;
  op:        string;
  value:     unknown;
  onChange:  (v: unknown) => void;
  disabled?: boolean;
}

const INPUT_BASE =
  "h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50";

export function ValueInput({ fieldType, op, value, onChange, disabled }: Props) {
  // Null ops need no value
  if (NULL_OPS.has(op)) return null;

  // Array ops — comma-separated text
  if (ARRAY_OPS.has(op)) {
    const display = Array.isArray(value) ? (value as string[]).join(", ") : "";
    return (
      <input
        type="text"
        disabled={disabled}
        placeholder="value1, value2, …"
        value={display}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className={`${INPUT_BASE} min-w-[180px] flex-1`}
      />
    );
  }

  // Boolean — Yes / No select
  if (fieldType === "boolean") {
    return (
      <select
        disabled={disabled}
        value={String(value ?? "true")}
        onChange={(e) => onChange(e.target.value === "true")}
        className={`${INPUT_BASE} w-24`}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  // Date
  if (fieldType === "timestamptz") {
    return (
      <input
        type="date"
        disabled={disabled}
        value={typeof value === "string" ? value.slice(0, 10) : ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} w-40`}
      />
    );
  }

  // Integer
  if (fieldType === "integer") {
    return (
      <input
        type="number"
        disabled={disabled}
        step={1}
        value={value === undefined || value === "" ? "" : String(value)}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : parseInt(e.target.value, 10))
        }
        className={`${INPUT_BASE} w-28`}
      />
    );
  }

  // Numeric (decimal)
  if (fieldType === "numeric") {
    return (
      <input
        type="number"
        disabled={disabled}
        step={0.01}
        value={value === undefined || value === "" ? "" : String(value)}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : parseFloat(e.target.value))
        }
        className={`${INPUT_BASE} w-32`}
      />
    );
  }

  // Default: text
  return (
    <input
      type="text"
      disabled={disabled}
      placeholder={op === "ilike" || op === "not_ilike" ? "e.g. %keyword%" : "value"}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT_BASE} min-w-[160px] flex-1`}
    />
  );
}
