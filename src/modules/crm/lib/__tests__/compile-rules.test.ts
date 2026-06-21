/**
 * T5 Injection & Validation Tests — Segment Rule Compiler
 *
 * Tests that:
 * 1. Hostile field names are rejected (SQL injection via field)
 * 2. Hostile operators are rejected (SQL injection via op)
 * 3. Unknown fields with injection payloads are blocked
 * 4. Nested AND/OR groups compile correctly
 * 5. Empty trees compile without errors
 * 6. All valid fields are accepted
 * 7. All valid operators are accepted with proper value types
 * 8. Value content never affects field/op safety (values are parameterized)
 */

import { describe, it, expect } from "vitest";
import {
  validateRuleTree,
  RuleValidationError,
  ALLOWED_FIELDS,
} from "../rule-tree";
import { compileRules as compile } from "../compile-rules";

// ── Helpers ───────────────────────────────────────────────────────────────────

function expectRejected(rules: unknown, fragment?: string) {
  expect(() => validateRuleTree(rules)).toThrow(RuleValidationError);
  if (fragment) {
    try {
      validateRuleTree(rules);
    } catch (e: any) {
      expect(e.message).toContain(fragment);
    }
  }
}

function simpleGroup(conditions: unknown[]) {
  return { type: "group", operator: "AND", conditions };
}

function cond(field: string, op: string, value?: unknown) {
  return { type: "condition", field, op, ...(value !== undefined ? { value } : {}) };
}

// ── 1. Hostile field names ────────────────────────────────────────────────────

describe("hostile field names are rejected", () => {
  const hostileFields = [
    "1; DROP TABLE crm_contacts; --",
    "email' OR '1'='1",
    "email; SELECT pg_sleep(10); --",
    "email UNION SELECT password FROM auth.users--",
    "'; DELETE FROM crm_contacts WHERE '1'='1",
    "../../etc/passwd",
    "__proto__",
    "constructor",
    "toString",
    // Valid-looking but not in allowlist
    "user_id",
    "profile_id",
    "created_at",
    "",
    " ",
    "EMAIL",        // case mismatch
    "Email",
    "is_Suppressed",
  ];

  for (const field of hostileFields) {
    it(`rejects field: ${JSON.stringify(field)}`, () => {
      expectRejected(simpleGroup([cond(field, "eq", "test@example.com")]));
    });
  }
});

// ── 2. Hostile operators ──────────────────────────────────────────────────────

describe("hostile operators are rejected", () => {
  const hostileOps = [
    "=",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
    "LIKE",
    "NOT LIKE",
    "IS",
    "IS NOT",
    "IN",
    "NOT IN",
    "similar_to",
    "eq; DROP TABLE crm_contacts; --",
    "eq' OR '1'='1",
    "eq UNION SELECT",
    "match",
    "contains",
    "overlaps",
    "",
    " ",
    "EQ",     // case mismatch
    "Eq",
  ];

  for (const op of hostileOps) {
    it(`rejects op: ${JSON.stringify(op)}`, () => {
      expectRejected(simpleGroup([cond("email", op, "x@y.com")]));
    });
  }
});

// ── 3. Hostile values don't affect field/op validation ────────────────────────

describe("hostile values in strings — field/op still validated first", () => {
  it("rejects hostile field even when value looks benign", () => {
    expectRejected(
      simpleGroup([{ type: "condition", field: "email'; DROP TABLE--", op: "eq", value: "safe@example.com" }])
    );
  });

  it("rejects hostile op even when value looks benign", () => {
    expectRejected(
      simpleGroup([{ type: "condition", field: "email", op: "eq'; DROP TABLE--", value: "safe@example.com" }])
    );
  });

  // When field+op are VALID, the value payload is accepted (it will be parameterized by Supabase)
  it("accepts hostile-looking value when field and op are valid (parameterized by Supabase)", () => {
    const hostileValues = [
      "'; DROP TABLE crm_contacts; --",
      "1=1 OR 1=1",
      "admin'--",
      "<script>alert(1)</script>",
      "null",
      "undefined",
      "0",
      "",
    ];
    for (const v of hostileValues) {
      expect(() => validateRuleTree(simpleGroup([cond("email", "eq", v)]))).not.toThrow();
    }
  });
});

// ── 4. Nested AND / OR groups ─────────────────────────────────────────────────

describe("nested AND/OR groups", () => {
  it("compiles nested AND inside OR", () => {
    const tree = {
      type: "group",
      operator: "OR",
      conditions: [
        cond("is_vto_lead", "eq", "true"),
        {
          type: "group",
          operator: "AND",
          conditions: [
            cond("lifetime_value", "gte", "1000"),
            cond("order_count", "gt", "2"),
          ],
        },
      ],
    };
    expect(() => validateRuleTree(tree)).not.toThrow();
    const { isEmpty, fieldColumns } = compile(tree);
    expect(isEmpty).toBe(false);
    expect(fieldColumns).toContain("is_vto_lead");
    expect(fieldColumns).toContain("lifetime_value");
    expect(fieldColumns).toContain("order_count");
  });

  it("compiles 3-level nesting", () => {
    const tree = {
      type: "group",
      operator: "AND",
      conditions: [
        cond("is_suppressed", "eq", "false"),
        {
          type: "group",
          operator: "OR",
          conditions: [
            cond("is_vto_lead", "eq", "true"),
            {
              type: "group",
              operator: "AND",
              conditions: [
                cond("try_on_count", "gte", "3"),
                cond("last_frame_name", "ilike", "%wayfarer%"),
              ],
            },
          ],
        },
      ],
    };
    expect(() => validateRuleTree(tree)).not.toThrow();
  });

  it("rejects invalid group operator", () => {
    expectRejected({
      type: "group",
      operator: "XOR",
      conditions: [cond("email", "eq", "x@y.com")],
    }, "AND");
  });

  it("rejects mixed: valid outer, hostile inner field", () => {
    expectRejected({
      type: "group",
      operator: "AND",
      conditions: [
        cond("email", "eq", "x@y.com"),
        cond("email'); DROP TABLE--", "eq", "x@y.com"),
      ],
    });
  });
});

// ── 5. Empty trees ────────────────────────────────────────────────────────────

describe("empty rule trees", () => {
  it("validates an empty root group", () => {
    const tree = { type: "group", operator: "AND", conditions: [] };
    expect(() => validateRuleTree(tree)).not.toThrow();
  });

  it("compileRules marks empty tree as isEmpty=true", () => {
    const { isEmpty } = compile({ type: "group", operator: "AND", conditions: [] });
    expect(isEmpty).toBe(true);
  });
});

// ── 6. All valid fields accepted ──────────────────────────────────────────────

describe("all allowlisted fields are accepted", () => {
  for (const field of Object.keys(ALLOWED_FIELDS)) {
    it(`accepts field: ${field}`, () => {
      expect(() =>
        validateRuleTree(simpleGroup([cond(field, "eq", "somevalue")]))
      ).not.toThrow();
    });
  }
});

// ── 7. All valid operators accepted with correct value shapes ─────────────────

describe("all allowlisted operators are accepted", () => {
  it("is_null requires no value", () => {
    expect(() =>
      validateRuleTree(simpleGroup([{ type: "condition", field: "phone", op: "is_null" }]))
    ).not.toThrow();
  });

  it("is_not_null requires no value", () => {
    expect(() =>
      validateRuleTree(simpleGroup([{ type: "condition", field: "last_order_at", op: "is_not_null" }]))
    ).not.toThrow();
  });

  it("is_null rejects if value is provided", () => {
    expectRejected(simpleGroup([cond("phone", "is_null", "something")]));
  });

  it("in requires array value", () => {
    expect(() =>
      validateRuleTree(simpleGroup([cond("email", "in", ["a@b.com", "c@d.com"])]))
    ).not.toThrow();
  });

  it("not_in requires array value", () => {
    expect(() =>
      validateRuleTree(simpleGroup([cond("email", "not_in", ["x@y.com"])]))
    ).not.toThrow();
  });

  it("in rejects scalar value", () => {
    expectRejected(simpleGroup([cond("email", "in", "a@b.com")]));
  });

  const scalarOps = ["eq","neq","gt","gte","lt","lte","ilike","not_ilike"] as const;
  for (const op of scalarOps) {
    it(`${op} accepts scalar value`, () => {
      expect(() =>
        validateRuleTree(simpleGroup([cond("email", op, "somevalue")]))
      ).not.toThrow();
    });

    it(`${op} rejects missing value`, () => {
      expectRejected(simpleGroup([{ type: "condition", field: "email", op }]));
    });
  }
});

// ── 8. Structural edge cases ──────────────────────────────────────────────────

describe("structural validation", () => {
  it("rejects non-object rule tree", () => {
    expectRejected(null);
    expectRejected(undefined);
    expectRejected("string");
    expectRejected(42);
  });

  it("rejects root node with type=condition (must be group)", () => {
    expectRejected(cond("email", "eq", "x@y.com"));
  });

  it("rejects missing conditions array", () => {
    expectRejected({ type: "group", operator: "AND" });
  });

  it("rejects non-array conditions", () => {
    expectRejected({ type: "group", operator: "AND", conditions: "bad" });
  });

  it("rejects condition with null field", () => {
    expectRejected(simpleGroup([{ type: "condition", field: null, op: "eq", value: "x" }]));
  });

  it("rejects condition with numeric op", () => {
    expectRejected(simpleGroup([{ type: "condition", field: "email", op: 123, value: "x" }]));
  });
});
