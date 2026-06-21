/**
 * Internal builder types add a stable `id` to every node so React can key
 * them properly and drag-and-drop can reference them by ID.
 * IDs are stripped before exporting the tree to the parent.
 */

import type {
  RuleTree,
  GroupNode,
  ConditionNode,
  RuleNode,
  FieldType,
  AllowedField,
  AllowedOp,
} from "../../lib/rule-tree";
import { ALLOWED_FIELDS } from "../../lib/rule-tree";

// ── Builder node types ────────────────────────────────────────────────────────

export interface BuilderConditionNode {
  type:   "condition";
  id:     string;
  field:  string;
  op:     string;
  value?: unknown;
}

export interface BuilderGroupNode {
  type:       "group";
  id:         string;
  operator:   "AND" | "OR";
  conditions: BuilderNode[];
}

export type BuilderNode = BuilderConditionNode | BuilderGroupNode;
export type BuilderTree = BuilderGroupNode;

// ── ID generation ─────────────────────────────────────────────────────────────

let _seq = 0;
export function genId(): string {
  return `n${++_seq}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── Operator metadata ─────────────────────────────────────────────────────────

export const OP_LABELS: Record<AllowedOp, string> = {
  eq:          "=",
  neq:         "≠",
  gt:          ">",
  gte:         "≥",
  lt:          "<",
  lte:         "≤",
  ilike:       "contains",
  not_ilike:   "doesn't contain",
  is_null:     "is empty",
  is_not_null: "is set",
  in:          "is one of",
  not_in:      "is not one of",
};

export const OPS_BY_TYPE: Record<FieldType, AllowedOp[]> = {
  text:        ["eq", "neq", "ilike", "not_ilike", "in", "not_in", "is_null", "is_not_null"],
  boolean:     ["eq", "neq", "is_null", "is_not_null"],
  integer:     ["eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in", "is_null", "is_not_null"],
  numeric:     ["eq", "neq", "gt", "gte", "lt", "lte", "is_null", "is_not_null"],
  timestamptz: ["eq", "neq", "gt", "gte", "lt", "lte", "is_null", "is_not_null"],
};

export const NULL_OPS = new Set<string>(["is_null", "is_not_null"]);
export const ARRAY_OPS = new Set<string>(["in", "not_in"]);

// ── Blank node factories ──────────────────────────────────────────────────────

export function makeBlankCondition(
  field: AllowedField = "email",
): BuilderConditionNode {
  const fieldDef = ALLOWED_FIELDS[field];
  const op       = OPS_BY_TYPE[fieldDef.type][0];
  return {
    type:  "condition",
    id:    genId(),
    field,
    op,
    value: ARRAY_OPS.has(op) ? [] : NULL_OPS.has(op) ? undefined : "",
  };
}

export function makeBlankGroup(): BuilderGroupNode {
  return {
    type:       "group",
    id:         genId(),
    operator:   "AND",
    conditions: [makeBlankCondition()],
  };
}

// ── Conversion: RuleTree ↔ BuilderTree ────────────────────────────────────────

export function addIds(tree: RuleTree): BuilderTree {
  function tag(node: RuleNode): BuilderNode {
    if (node.type === "condition") return { ...node, id: genId() };
    return { ...node, id: genId(), conditions: node.conditions.map(tag) };
  }
  return tag(tree) as BuilderTree;
}

export function stripIds(tree: BuilderTree): RuleTree {
  function strip(node: BuilderNode): RuleNode {
    const { id: _id, ...rest } = node as BuilderNode & { id: string };
    if (rest.type === "condition") return rest as ConditionNode;
    return { ...rest, conditions: (rest as BuilderGroupNode).conditions.map(strip) } as GroupNode;
  }
  return strip(tree) as RuleTree;
}

// ── Immutable tree mutation helpers ──────────────────────────────────────────

function mapNode(
  node: BuilderNode,
  id: string,
  fn: (n: BuilderNode) => BuilderNode,
): BuilderNode {
  if (node.id === id) return fn(node);
  if (node.type === "group") {
    return { ...node, conditions: node.conditions.map((c) => mapNode(c, id, fn)) };
  }
  return node;
}

export function updateNode(
  tree: BuilderTree,
  id: string,
  fn: (n: BuilderNode) => BuilderNode,
): BuilderTree {
  return mapNode(tree, id, fn) as BuilderTree;
}

export function removeNode(tree: BuilderTree, id: string): BuilderTree {
  function prune(node: BuilderNode): BuilderNode {
    if (node.type !== "group") return node;
    return {
      ...node,
      conditions: node.conditions
        .filter((c) => c.id !== id)
        .map(prune),
    };
  }
  return prune(tree) as BuilderTree;
}

export function addToGroup(
  tree: BuilderTree,
  groupId: string,
  child: BuilderNode,
): BuilderTree {
  return updateNode(tree, groupId, (g) => {
    if (g.type !== "group") return g;
    return { ...g, conditions: [...g.conditions, child] };
  });
}

export function reorderInGroup(
  tree: BuilderTree,
  groupId: string,
  from: number,
  to: number,
): BuilderTree {
  return updateNode(tree, groupId, (g) => {
    if (g.type !== "group") return g;
    const arr = [...g.conditions];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    return { ...g, conditions: arr };
  });
}
