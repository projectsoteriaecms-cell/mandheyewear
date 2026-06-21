/**
 * RuleTreeBuilder
 *
 * Visual drag-and-drop segment rule editor.  Renders a tree of AND/OR groups
 * and condition rows.  Validates the tree on every change and calls onChange
 * only when the tree is valid (or empty).
 *
 * Usage:
 *   <RuleTreeBuilder
 *     value={segment.rules_json as RuleTree}
 *     onChange={(tree) => updateSegment({ rules_json: tree })}
 *   />
 */

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { RuleTree } from "../../lib/rule-tree";
import { validateRuleTree, isEmptyRuleTree, RuleValidationError } from "../../lib/rule-tree";
import type { BuilderTree } from "./builder-types";
import {
  addIds,
  stripIds,
  makeBlankGroup,
} from "./builder-types";
import { RuleGroup } from "./RuleGroup";

// ── Empty tree sentinel ───────────────────────────────────────────────────────

const EMPTY_TREE: RuleTree = { type: "group", operator: "AND", conditions: [] };

// ── Props ─────────────────────────────────────────────────────────────────────

export interface RuleTreeBuilderProps {
  /** Current rule tree.  Pass `undefined` or an empty group to start fresh. */
  value?:       RuleTree | null;
  /** Called whenever the tree changes AND passes validation. */
  onChange?:    (tree: RuleTree) => void;
  /** Called whenever the tree changes (even if invalid), with the raw JSON. */
  onChangeRaw?: (tree: RuleTree) => void;
  /** Set true to render in read-only mode (no controls). */
  readOnly?:    boolean;
  /** Label shown above the builder. */
  label?:       string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RuleTreeBuilder({
  value,
  onChange,
  onChangeRaw,
  readOnly,
  label,
}: RuleTreeBuilderProps) {
  const [builderTree, setBuilderTree] = useState<BuilderTree>(() =>
    addIds(value ?? EMPTY_TREE),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync when value prop changes from outside
  useEffect(() => {
    setBuilderTree(addIds(value ?? EMPTY_TREE));
    setValidationError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  const handleChange = useCallback(
    (updated: BuilderTree) => {
      setBuilderTree(updated);
      const plain = stripIds(updated);
      onChangeRaw?.(plain);

      // Skip validation for empty trees — they're valid (match all contacts)
      if (isEmptyRuleTree(plain)) {
        setValidationError(null);
        onChange?.(plain);
        return;
      }

      try {
        const validated = validateRuleTree(plain);
        setValidationError(null);
        onChange?.(validated);
      } catch (err) {
        setValidationError(
          err instanceof RuleValidationError ? err.message : String(err),
        );
      }
    },
    [onChange, onChangeRaw],
  );

  function handleReset() {
    const blank = makeBlankGroup();
    setBuilderTree(blank);
    setValidationError(null);
    onChange?.(EMPTY_TREE);
  }

  const totalConditions = countConditions(builderTree);

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        {label && (
          <p className="text-sm font-medium text-foreground">{label}</p>
        )}
        {!readOnly && totalConditions > 0 && (
          <button
            type="button"
            onClick={handleReset}
            title="Clear all rules"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <RefreshCw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Rule tree */}
      <RuleGroup
        group={builderTree}
        depth={0}
        onChange={handleChange}
        readOnly={readOnly}
      />

      {/* Validation error banner */}
      {validationError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Summary chip */}
      {!validationError && totalConditions > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {totalConditions} condition{totalConditions !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countConditions(tree: BuilderTree): number {
  let n = 0;
  function walk(node: { type: string; conditions?: unknown[] }) {
    if (node.type === "condition") { n++; return; }
    (node.conditions ?? []).forEach((c) => walk(c as typeof node));
  }
  walk(tree);
  return n;
}
