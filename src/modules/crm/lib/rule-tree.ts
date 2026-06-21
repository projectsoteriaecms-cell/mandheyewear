/**
 * CRM Segment Rule Tree
 *
 * Defines the types, allowlists, and validation logic for segment rules.
 * The allowlists are the ONLY source of truth for what field names and
 * operators are valid — nothing from user input ever bypasses them.
 */

export type FieldType = "text" | "numeric" | "boolean" | "timestamptz" | "integer";

export interface FieldDef {
  /** Exact column name in crm_contacts view */
  column: string;
  type: FieldType;
  /** Human-readable label for the rule-builder UI */
  label: string;
  nullable?: boolean;
}

/**
 * Exhaustive allowlist of fields that may appear in a segment rule.
 * Derived directly from crm_contacts view columns (migration 20260619000000).
 * Adding a new field here is the ONLY way to make it targetable.
 */
export const ALLOWED_FIELDS = {
  email:                    { column: "email",                    type: "text",        label: "Email" },
  full_name:                { column: "full_name",                type: "text",        label: "Full Name",              nullable: true },
  phone:                    { column: "phone",                    type: "text",        label: "Phone",                  nullable: true },
  is_vto_lead:              { column: "is_vto_lead",              type: "boolean",     label: "Is VTO Lead" },
  is_newsletter_subscriber: { column: "is_newsletter_subscriber", type: "boolean",     label: "Newsletter Subscriber" },
  is_registered:            { column: "is_registered",            type: "boolean",     label: "Is Registered" },
  marketing_consent:        { column: "marketing_consent",        type: "boolean",     label: "Marketing Consent" },
  newsletter_active:        { column: "newsletter_active",        type: "boolean",     label: "Newsletter Active" },
  is_suppressed:            { column: "is_suppressed",            type: "boolean",     label: "Is Suppressed" },
  try_on_count:             { column: "try_on_count",             type: "integer",     label: "Try-On Count" },
  lifetime_value:           { column: "lifetime_value",           type: "numeric",     label: "Lifetime Value (₦)" },
  order_count:              { column: "order_count",              type: "integer",     label: "Order Count" },
  last_order_at:            { column: "last_order_at",            type: "timestamptz", label: "Last Order Date",        nullable: true },
  first_seen:               { column: "first_seen",               type: "timestamptz", label: "First Seen",             nullable: true },
  last_activity_at:         { column: "last_activity_at",         type: "timestamptz", label: "Last Activity",          nullable: true },
  prescription_on_file:     { column: "prescription_on_file",     type: "boolean",     label: "Prescription on File" },
  last_frame_name:          { column: "last_frame_name",          type: "text",        label: "Last Frame Tried",       nullable: true },
} as const satisfies Record<string, FieldDef>;

export type AllowedField = keyof typeof ALLOWED_FIELDS;

/** Comparison operators for scalar values */
export type CompareOp  = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
/** Text search operators */
export type TextOp     = "ilike" | "not_ilike";
/** Null-check operators (no value required) */
export type NullOp     = "is_null" | "is_not_null";
/** Set-membership operators (value must be an array) */
export type SetOp      = "in" | "not_in";

export type AllowedOp = CompareOp | TextOp | NullOp | SetOp;

export const ALLOWED_OPS: readonly AllowedOp[] = [
  "eq", "neq", "gt", "gte", "lt", "lte",
  "ilike", "not_ilike",
  "is_null", "is_not_null",
  "in", "not_in",
] as const;

// Fast lookup set for O(1) membership check
export const ALLOWED_OPS_SET: ReadonlySet<string> = new Set(ALLOWED_OPS);
export const ALLOWED_FIELDS_SET: ReadonlySet<string> = new Set(Object.keys(ALLOWED_FIELDS));

// ── AST nodes ──────────────────────────────────────────────────────────────────

export interface ConditionNode {
  type: "condition";
  /** Must be a key of ALLOWED_FIELDS */
  field: string;
  /** Must be a member of ALLOWED_OPS */
  op: string;
  /** Absent for is_null/is_not_null; array for in/not_in; scalar otherwise */
  value?: unknown;
}

export interface GroupNode {
  type: "group";
  operator: "AND" | "OR";
  conditions: RuleNode[];
}

export type RuleNode = ConditionNode | GroupNode;
export type RuleTree = GroupNode;

// ── Validation ─────────────────────────────────────────────────────────────────

export class RuleValidationError extends Error {
  constructor(
    message: string,
    public readonly path: string = "",
  ) {
    super(path ? `[${path}] ${message}` : message);
    this.name = "RuleValidationError";
  }
}

function validateNode(node: unknown, path: string): void {
  if (!node || typeof node !== "object") {
    throw new RuleValidationError("Rule node must be an object", path);
  }
  const n = node as Record<string, unknown>;

  if (n.type === "condition") {
    // Validate field — the most critical injection point
    if (typeof n.field !== "string" || !ALLOWED_FIELDS_SET.has(n.field)) {
      throw new RuleValidationError(
        `Unknown field "${n.field}". Allowed: ${[...ALLOWED_FIELDS_SET].join(", ")}`,
        `${path}.field`,
      );
    }
    // Validate operator
    if (typeof n.op !== "string" || !ALLOWED_OPS_SET.has(n.op)) {
      throw new RuleValidationError(
        `Unknown operator "${n.op}". Allowed: ${ALLOWED_OPS.join(", ")}`,
        `${path}.op`,
      );
    }
    // Null ops must not have a value
    if ((n.op === "is_null" || n.op === "is_not_null") && n.value !== undefined) {
      throw new RuleValidationError(
        `Operator "${n.op}" must not have a value`,
        `${path}.value`,
      );
    }
    // Set ops must have an array value
    if ((n.op === "in" || n.op === "not_in") && !Array.isArray(n.value)) {
      throw new RuleValidationError(
        `Operator "${n.op}" requires an array value`,
        `${path}.value`,
      );
    }
    // Comparison ops must have a non-null value
    if (!["is_null", "is_not_null"].includes(n.op) && n.value === undefined) {
      throw new RuleValidationError(
        `Operator "${n.op}" requires a value`,
        `${path}.value`,
      );
    }
    return;
  }

  if (n.type === "group") {
    if (n.operator !== "AND" && n.operator !== "OR") {
      throw new RuleValidationError(
        `Group operator must be "AND" or "OR", got "${n.operator}"`,
        `${path}.operator`,
      );
    }
    if (!Array.isArray(n.conditions)) {
      throw new RuleValidationError("Group conditions must be an array", `${path}.conditions`);
    }
    for (let i = 0; i < (n.conditions as unknown[]).length; i++) {
      validateNode((n.conditions as unknown[])[i], `${path}.conditions[${i}]`);
    }
    return;
  }

  throw new RuleValidationError(`Unknown node type "${n.type}"`, `${path}.type`);
}

/**
 * Validates an entire rule tree, throwing `RuleValidationError` on any
 * unknown field, unknown operator, or structural problem.
 * Call this before passing rules to any query builder or Postgres function.
 */
export function validateRuleTree(rules: unknown): RuleTree {
  if (!rules || typeof rules !== "object") {
    throw new RuleValidationError("Rule tree must be an object");
  }
  const r = rules as Record<string, unknown>;
  if (r.type !== "group") {
    throw new RuleValidationError('Root node must be type "group"');
  }
  validateNode(rules, "root");
  return rules as RuleTree;
}

/** Returns true if the tree contains no real filters (empty group). */
export function isEmptyRuleTree(tree: RuleTree): boolean {
  return tree.conditions.length === 0;
}
