/**
 * Recursive group renderer.
 *
 * Renders an AND/OR toggle, all child nodes (conditions or nested groups),
 * and add/remove buttons.  Handles drag-and-drop reordering of children
 * within the group via the HTML5 DnD API.
 */

import { useRef, useState } from "react";
import { Plus, FolderPlus, Trash2 } from "lucide-react";
import { RuleCondition } from "./RuleCondition";
import type { BuilderGroupNode, BuilderNode } from "./builder-types";
import { makeBlankCondition, makeBlankGroup } from "./builder-types";

interface Props {
  group:    BuilderGroupNode;
  depth:    number;
  onChange: (updated: BuilderGroupNode) => void;
  onRemove?: () => void;   // undefined for root group
  readOnly?: boolean;
}

// Indent colour stripe per depth (cycles at 4)
const DEPTH_COLOURS = [
  "border-l-blue-400",
  "border-l-violet-400",
  "border-l-emerald-400",
  "border-l-amber-400",
];

export function RuleGroup({ group, depth, onChange, onRemove, readOnly }: Props) {
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragCounter = useRef(0);

  function updateConditionAt(index: number, updated: BuilderNode) {
    const next = [...group.conditions];
    next[index] = updated;
    onChange({ ...group, conditions: next });
  }

  function removeAt(index: number) {
    onChange({ ...group, conditions: group.conditions.filter((_, i) => i !== index) });
  }

  function addCondition() {
    onChange({ ...group, conditions: [...group.conditions, makeBlankCondition()] });
  }

  function addGroup() {
    onChange({ ...group, conditions: [...group.conditions, makeBlankGroup()] });
  }

  function toggleOperator() {
    onChange({ ...group, operator: group.operator === "AND" ? "OR" : "AND" });
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function handleDragStart(index: number, e: React.DragEvent) {
    setDragSrc(index);
    e.dataTransfer.effectAllowed = "move";
    // Drag image: ghost is the row itself
    e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 12, 12);
  }

  function handleDragEnter(index: number) {
    dragCounter.current++;
    setDragOver(index);
  }

  function handleDragLeave() {
    dragCounter.current--;
    if (dragCounter.current === 0) setDragOver(null);
  }

  function handleDrop(toIndex: number, e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOver(null);
    if (dragSrc === null || dragSrc === toIndex) { setDragSrc(null); return; }

    const arr = [...group.conditions];
    const [item] = arr.splice(dragSrc, 1);
    arr.splice(toIndex, 0, item);
    onChange({ ...group, conditions: arr });
    setDragSrc(null);
  }

  function handleDragEnd() {
    setDragSrc(null);
    setDragOver(null);
    dragCounter.current = 0;
  }

  const isRoot = depth === 0;
  const depthColour = DEPTH_COLOURS[depth % DEPTH_COLOURS.length];

  return (
    <div
      className={[
        "rounded-lg border bg-card",
        isRoot ? "border-border" : `border-l-2 ${depthColour} border-t border-r border-b`,
        "shadow-sm",
      ].join(" ")}
    >
      {/* Header: AND/OR toggle + remove button */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60">
        <span className="text-xs text-muted-foreground font-medium">Match</span>

        <button
          type="button"
          disabled={readOnly}
          onClick={toggleOperator}
          title={`Switch to ${group.operator === "AND" ? "OR" : "AND"}`}
          className={[
            "rounded px-2 py-0.5 text-xs font-bold tracking-wide transition-colors",
            group.operator === "AND"
              ? "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:text-blue-400"
              : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400",
            readOnly && "pointer-events-none",
          ].filter(Boolean).join(" ")}
        >
          {group.operator}
        </button>

        <span className="text-xs text-muted-foreground">of the following</span>

        {/* Remove group (not shown for root) */}
        {onRemove && !readOnly && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove group"
            className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Conditions */}
      <div className="px-2 py-1.5 space-y-0.5">
        {group.conditions.length === 0 && (
          <p className="px-2 py-3 text-xs text-muted-foreground text-center italic">
            No rules yet — add a condition below.
          </p>
        )}

        {group.conditions.map((node, i) => (
          <div
            key={node.id}
            draggable={!readOnly}
            onDragStart={(e) => handleDragStart(i, e)}
            onDragEnter={() => handleDragEnter(i)}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(i, e)}
            onDragEnd={handleDragEnd}
            className={[
              "relative transition-all",
              dragOver === i && dragSrc !== i
                ? "ring-2 ring-blue-400 ring-offset-1 rounded-md"
                : "",
            ].join(" ")}
          >
            {node.type === "condition" ? (
              <RuleCondition
                condition={node}
                onChange={(updated) => updateConditionAt(i, updated)}
                onRemove={() => removeAt(i)}
                readOnly={readOnly}
                isDragging={dragSrc === i}
                dragProps={{
                  onMouseDown: (e) => e.stopPropagation(),
                }}
              />
            ) : (
              // Nested group — recurse
              <div className="my-1.5 ml-2">
                <RuleGroup
                  group={node}
                  depth={depth + 1}
                  onChange={(updated) => updateConditionAt(i, updated)}
                  onRemove={() => removeAt(i)}
                  readOnly={readOnly}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer: add buttons */}
      {!readOnly && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-t border-border/60">
          <button
            type="button"
            onClick={addCondition}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add condition
          </button>
          {depth < 2 && (
            <button
              type="button"
              onClick={addGroup}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <FolderPlus className="h-3 w-3" />
              Add group
            </button>
          )}
        </div>
      )}
    </div>
  );
}
