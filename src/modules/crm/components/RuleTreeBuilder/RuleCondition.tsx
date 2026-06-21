/**
 * Single condition row: [drag handle] [field ▾] [op ▾] [value input] [×]
 *
 * When the field changes the op is reset to the first valid op for the new
 * field type, and the value is cleared.  When the op changes between a
 * scalar op and an array op the value is reset to the appropriate empty shape.
 */

import { GripVertical, X } from "lucide-react";
import { ALLOWED_FIELDS } from "../../lib/rule-tree";
import type { BuilderConditionNode } from "./builder-types";
import {
  OPS_BY_TYPE,
  OP_LABELS,
  NULL_OPS,
  ARRAY_OPS,
} from "./builder-types";
import { ValueInput } from "./ValueInput";

interface Props {
  condition:  BuilderConditionNode;
  onChange:   (updated: BuilderConditionNode) => void;
  onRemove:   () => void;
  readOnly?:  boolean;
  // Drag props
  dragProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

const SELECT_BASE =
  "h-8 rounded border border-input bg-background px-2 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 appearance-none cursor-pointer";

export function RuleCondition({
  condition,
  onChange,
  onRemove,
  readOnly,
  dragProps,
  isDragging,
}: Props) {
  const fieldDef   = ALLOWED_FIELDS[condition.field as keyof typeof ALLOWED_FIELDS];
  const validOps   = fieldDef ? OPS_BY_TYPE[fieldDef.type] : [];

  function handleFieldChange(newField: string) {
    const newFieldDef = ALLOWED_FIELDS[newField as keyof typeof ALLOWED_FIELDS];
    if (!newFieldDef) return;
    const newOp    = OPS_BY_TYPE[newFieldDef.type][0];
    const newValue = ARRAY_OPS.has(newOp) ? [] : NULL_OPS.has(newOp) ? undefined : "";
    onChange({ ...condition, field: newField, op: newOp, value: newValue });
  }

  function handleOpChange(newOp: string) {
    // Reset value shape if switching between scalar / array / null
    const wasArray = ARRAY_OPS.has(condition.op);
    const isArray  = ARRAY_OPS.has(newOp);
    const isNull   = NULL_OPS.has(newOp);

    let newValue: unknown = condition.value;
    if (isNull)            newValue = undefined;
    else if (isArray && !wasArray) newValue = [];
    else if (!isArray && wasArray) newValue = "";

    onChange({ ...condition, op: newOp, value: newValue });
  }

  return (
    <div
      className={[
        "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
        isDragging
          ? "opacity-40"
          : "hover:bg-muted/40",
      ].join(" ")}
    >
      {/* Drag handle */}
      <div
        {...dragProps}
        className={[
          "flex-none cursor-grab text-muted-foreground active:cursor-grabbing",
          readOnly && "invisible",
        ].filter(Boolean).join(" ")}
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Field selector */}
      <div className="relative">
        <select
          disabled={readOnly}
          value={condition.field}
          onChange={(e) => handleFieldChange(e.target.value)}
          className={`${SELECT_BASE} w-44`}
        >
          {Object.entries(ALLOWED_FIELDS).map(([key, def]) => (
            <option key={key} value={key}>
              {def.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
      </div>

      {/* Op selector */}
      <div className="relative">
        <select
          disabled={readOnly}
          value={condition.op}
          onChange={(e) => handleOpChange(e.target.value)}
          className={`${SELECT_BASE} w-36`}
        >
          {validOps.map((op) => (
            <option key={op} value={op}>
              {OP_LABELS[op]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
      </div>

      {/* Value input */}
      <ValueInput
        fieldType={fieldDef?.type ?? "text"}
        op={condition.op}
        value={condition.value}
        onChange={(v) => onChange({ ...condition, value: v })}
        disabled={readOnly}
      />

      {/* Remove */}
      {!readOnly && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove condition"
          className="flex-none rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
