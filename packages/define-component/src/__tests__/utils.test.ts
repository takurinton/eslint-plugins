import { TSESLint } from "@typescript-eslint/utils";
import { describe, expect, it, vi } from "vitest";
import { isInsideFunctionScope } from "../rules/utils";
import { Errors } from "../rules";

describe("isInsideFunctionScope", () => {
  it("returns false when there are no function ancestors", () => {
    const context = {
      getAncestors: vi.fn().mockReturnValue([]),
    } as unknown as TSESLint.RuleContext<Errors, []>;

    expect(isInsideFunctionScope(context)).toBe(false);
  });

  it("returns true when there is a function ancestor", () => {
    const contextWithFunctionAncestor = {
      getAncestors: vi.fn().mockReturnValue([{ type: "FunctionDeclaration" }]),
    } as unknown as TSESLint.RuleContext<Errors, []>;

    expect(isInsideFunctionScope(contextWithFunctionAncestor)).toBe(true);
  });
});
