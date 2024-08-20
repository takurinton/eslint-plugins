// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect } from "vitest";
import { TSESTree } from "@typescript-eslint/utils";
import { getProperties, findMismatchedPropertiesKeys } from "../rules/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

describe("getProperties", () => {
  it("should return properties for a valid ObjectExpression", () => {
    const node: TSESTree.ObjectExpression = {
      type: AST_NODE_TYPES.ObjectExpression,
      properties: [
        {
          type: AST_NODE_TYPES.Property,
          key: { type: AST_NODE_TYPES.Identifier, name: "foo" },
          value: { type: AST_NODE_TYPES.Literal, value: "foo" },
          kind: "init",
          method: false,
          shorthand: false,
          computed: false,
        },
        {
          type: AST_NODE_TYPES.Property,
          key: { type: AST_NODE_TYPES.Identifier, name: "bar" },
          value: { type: AST_NODE_TYPES.Literal, value: "bar" },
          kind: "init",
          method: false,
          shorthand: false,
          computed: false,
        },
      ],
    };

    const result = getProperties(node);

    expect(result).toEqual({
      foo: "foo",
      bar: "bar",
    });
  });

  it("should return null if ObjectExpression contains non-Identifier key", () => {
    const node: TSESTree.ObjectExpression = {
      type: AST_NODE_TYPES.ObjectExpression,
      properties: [
        {
          type: AST_NODE_TYPES.Property,
          key: { type: AST_NODE_TYPES.Literal, value: "invalidKey" }, // Invalid key type
          value: { type: AST_NODE_TYPES.Literal, value: "value" },
          kind: "init",
          method: false,
          shorthand: false,
          computed: false,
        },
      ],
    };

    const result = getProperties(node);

    expect(result).toBeNull();
  });

  it("should return null if ObjectExpression contains non-Property", () => {
    const node: TSESTree.ObjectExpression = {
      type: AST_NODE_TYPES.ObjectExpression,
      properties: [
        {
          type: AST_NODE_TYPES.SpreadElement, // Invalid property type
          argument: { type: AST_NODE_TYPES.Identifier, name: "spread" },
        } as TSESTree.SpreadElement,
      ],
    };

    const result = getProperties(node);

    expect(result).toBeNull();
  });

  it("should return string value for Literal node", () => {
    const node: TSESTree.Literal = {
      type: AST_NODE_TYPES.Literal,
      value: "hello world",
    };

    const result = getProperties(node);

    expect(result).toBe("hello world");
  });

  it("should return null for non-ObjectExpression and non-Literal nodes", () => {
    const node: TSESTree.Identifier = {
      type: AST_NODE_TYPES.Identifier,
      name: "identifierName",
    };

    const result = getProperties(node);

    expect(result).toBeNull();
  });
});

describe("findMismatchedPropertiesKeys", () => {
  it("should return true for maps with identical nested keys", () => {
    const map = new Map<string, unknown>([
      ["obj1", { properties: { a: 1, b: { c: 2, d: 3 } } }],
      ["obj2", { properties: { a: 10, b: { c: 20, d: 30 } } }],
    ]);

    const result = findMismatchedPropertiesKeys(map);
    expect(result).toBe(null);
  });

  it("should return false for maps with different nested keys", () => {
    const map = new Map<string, unknown>([
      ["obj1", { properties: { a: 1, b: { c: 2, d: 3 } } }],
      ["obj2", { properties: { a: 10, b: { c: 20, e: 30 } } }], // Different key "e"
    ]);

    const result = findMismatchedPropertiesKeys(map);
    expect(result).toEqual(["b.d", "b.e"]);
  });

  it("should return false for maps with different top-level keys", () => {
    const map = new Map<string, unknown>([
      ["obj1", { properties: { a: 1, b: 2 } }],
      ["obj2", { properties: { a: 1, c: 2 } }], // Different key "c"
    ]);

    const result = findMismatchedPropertiesKeys(map);
    expect(result).toEqual(["b", "c"]);
  });

  it("should return true for empty maps", () => {
    const map = new Map<string, unknown>();

    const result = findMismatchedPropertiesKeys(map);
    expect(result).toBe(null);
  });

  it("should return true for maps with identical simple keys", () => {
    const map = new Map<string, unknown>([
      ["obj1", { properties: { a: 1, b: 2 } }],
      ["obj2", { properties: { a: 3, b: 4 } }],
    ]);

    const result = findMismatchedPropertiesKeys(map);
    expect(result).toBe(null);
  });

  it("should return false for maps where one object is empty", () => {
    const map = new Map<string, unknown>([
      ["obj1", { properties: { a: 1, b: 2 } }],
      ["obj2", { properties: {} }],
    ]);

    const result = findMismatchedPropertiesKeys(map);
    expect(result).toEqual(["a", "b"]);
  });
});
