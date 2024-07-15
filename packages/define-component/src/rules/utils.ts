import { TSESLint } from "@typescript-eslint/utils";
import { Errors } from ".";

export const isInsideFunctionScope = (
  context: TSESLint.RuleContext<Errors, []>,
) => {
  for (const ancestor of context.getAncestors()) {
    if (
      ancestor.type === "FunctionDeclaration" ||
      ancestor.type === "FunctionExpression" ||
      ancestor.type === "ArrowFunctionExpression"
    ) {
      return true;
    }
  }

  return false;
};
