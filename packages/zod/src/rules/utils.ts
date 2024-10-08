import { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { Errors } from "./types";

export const getZodChainMethods = (
  context: TSESLint.RuleContext<Errors, []>,
) => {
  const ancestors = context.getAncestors();
  const parents = ancestors
    .filter(
      (
        ancestor,
      ): ancestor is TSESTree.MemberExpression & {
        property: TSESTree.Identifier;
      } =>
        ancestor.type === "MemberExpression" &&
        ancestor.property.type === "Identifier",
    )
    .map((ancestor) => ancestor.property.name);

  return parents;
};

export const requireMinErrorMessage = (
  context: TSESLint.RuleContext<Errors, []>,
) => {
  const ancestors = context.getAncestors();
  const callExpressionAncestor = ancestors.find(
    (ancestor): ancestor is TSESTree.CallExpression =>
      ancestor.type === "CallExpression" &&
      ancestor.callee.type === "MemberExpression" &&
      ancestor.callee.property.type === "Identifier" &&
      ancestor.callee.property.name === "min",
  );

  if (callExpressionAncestor) {
    const args = callExpressionAncestor.arguments;
    if (args.length === 1) {
      return "not_min_error_message";
    }
    if (args.length === 2 && args[1].type === "Literal") {
      return "error_message_must_be_object";
    }
  }
};

export const requireMaxErrorMessage = (
  context: TSESLint.RuleContext<Errors, []>,
) => {
  const ancestors = context.getAncestors();
  const callExpressionAncestor = ancestors.find(
    (ancestor): ancestor is TSESTree.CallExpression =>
      ancestor.type === "CallExpression" &&
      ancestor.callee.type === "MemberExpression" &&
      ancestor.callee.property.type === "Identifier" &&
      ancestor.callee.property.name === "max",
  );

  if (callExpressionAncestor) {
    const args = callExpressionAncestor.arguments;
    if (args.length === 1) {
      return "not_max_error_message";
    }
    if (args.length === 2 && args[1].type === "Literal") {
      return "error_message_must_be_object";
    }
  }
};

export const doNotUseOtherThanMinAndMaxIfNumber = (parents: string[]) => {
  const notAllowed = [
    "gt",
    "gte",
    "lt",
    "lte",
    "positive",
    "negative",
    "nonnegative",
    "nonpositive",
  ];

  return parents.some((parent) => notAllowed.includes(parent));
};

export const stringMustHaveMinIfNotNullable = (parents: string[]) =>
  !(
    parents.includes("nullable") ||
    parents.includes("optional") ||
    parents.includes("nullish") ||
    parents.includes("min")
  );
