import { describe, it, expect } from "vitest";
import { resolveBooleanExpr } from "@buildnbuzz/form-core";
import { compileToExpression } from "./expressions";
import type { ExpressionGroup } from "../types";

describe("expressions utility", () => {
  it("returns undefined for empty group", () => {
    expect(compileToExpression(null)).toBeUndefined();
    expect(compileToExpression({
      id: "1",
      type: "group",
      logicalOperator: "AND",
      children: [],
    })).toBeUndefined();
  });

  it("compiles a single rule to an AtomicCondition", () => {
    const group: ExpressionGroup = {
      id: "1",
      type: "group",
      logicalOperator: "AND",
      children: [
        {
          id: "r1",
          type: "rule",
          fieldId: "role",
          operator: "equals",
          value: "admin",
        },
      ],
    };
    
    expect(compileToExpression(group)).toEqual({
      $data: "/role",
      eq: "admin",
    });
  });

  it("compiles AND logical operator", () => {
    const group: ExpressionGroup = {
      id: "1",
      type: "group",
      logicalOperator: "AND",
      children: [
        { id: "r1", type: "rule", fieldId: "a", operator: "equals", value: "1" },
        { id: "r2", type: "rule", fieldId: "b", operator: "equals", value: "2" },
      ],
    };
    
    expect(compileToExpression(group)).toEqual({
      $and: [
        { $data: "/a", eq: "1" },
        { $data: "/b", eq: "2" },
      ],
    });
  });

  it("compiles OR logical operator", () => {
    const group: ExpressionGroup = {
      id: "1",
      type: "group",
      logicalOperator: "OR",
      children: [
        { id: "r1", type: "rule", fieldId: "a", operator: "equals", value: "1" },
        { id: "r2", type: "rule", fieldId: "b", operator: "equals", value: "2" },
      ],
    };
    
    expect(compileToExpression(group)).toEqual({
      $or: [
        { $data: "/a", eq: "1" },
        { $data: "/b", eq: "2" },
      ],
    });
  });

  it("handles recursive groups", () => {
    const group: ExpressionGroup = {
      id: "g1",
      type: "group",
      logicalOperator: "AND",
      children: [
        { id: "r1", type: "rule", fieldId: "x", operator: "equals", value: "y" },
        {
          id: "g2",
          type: "group",
          logicalOperator: "OR",
          children: [
            { id: "r2", type: "rule", fieldId: "a", operator: "is_empty", value: "" },
          ],
        },
      ],
    };
    
    expect(compileToExpression(group)).toEqual({
      $and: [
        { $data: "/x", eq: "y" },
        { $data: "/a", not: true },
      ],
    });
  });

  it("compiles numeric comparisons", () => {
    const group: ExpressionGroup = {
      id: "1",
      type: "group",
      logicalOperator: "AND",
      children: [
        { id: "r1", type: "rule", fieldId: "age", operator: "greater_than", value: "18" },
      ],
    };
    
    expect(compileToExpression(group)).toEqual({
      $data: "/age",
      gt: 18,
    });
  });

  describe("integration with form-core resolver", () => {
    it("resolves compiled expressions against data", () => {
      const group: ExpressionGroup = {
        id: "1",
        type: "group",
        logicalOperator: "AND",
        children: [
          { id: "r1", type: "rule", fieldId: "role", operator: "equals", value: "admin" },
          { id: "r2", type: "rule", fieldId: "age", operator: "greater_than", value: "21" },
        ],
      };

      const expr = compileToExpression(group);
      
      // Match
      expect(resolveBooleanExpr(expr, { 
        data: { role: "admin", age: 25 } 
      })).toBe(true);

      // Fail one
      expect(resolveBooleanExpr(expr, { 
        data: { role: "user", age: 25 } 
      })).toBe(false);

      // Fail other
      expect(resolveBooleanExpr(expr, { 
        data: { role: "admin", age: 18 } 
      })).toBe(false);
    });

    it("handles is_empty correctly in resolver", () => {
      const group: ExpressionGroup = {
        id: "1",
        type: "group",
        logicalOperator: "AND",
        children: [
          { id: "r1", type: "rule", fieldId: "bio", operator: "is_empty", value: "" },
        ],
      };

      const expr = compileToExpression(group);
      
      expect(resolveBooleanExpr(expr, { data: { bio: "" } })).toBe(true);
      expect(resolveBooleanExpr(expr, { data: { bio: null } })).toBe(true);
      expect(resolveBooleanExpr(expr, { data: { bio: undefined } })).toBe(true);
      expect(resolveBooleanExpr(expr, { data: { bio: "hello" } })).toBe(false);
    });
  });
});
