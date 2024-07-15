import { TSESLint } from "@typescript-eslint/utils";
import { MessageId } from "./types";
import { messages } from "./messages";

/**
 * ローカル変数の命名規則
 */
export const localVars: TSESLint.RuleModule<MessageId, []> = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "`_`が先頭についている値はコンポーネントに渡すことはできません。",
      recommended: "recommended",
      url: "",
    },
    schema: [],
    messages,
  },
  defaultOptions: [],
  create(context) {
    const { filename } = context;
    const isTSX = filename.endsWith(".tsx");
    // .ts を除外するかどうかは要検討
    if (!isTSX) {
      return {};
    }
    return {
      JSXOpeningElement(node) {
        node.attributes.forEach((attribute) => {
          if (attribute.type === "JSXAttribute") {
            const value = attribute.value;
            if (value && value.type === "JSXExpressionContainer") {
              const expression = value.expression;
              // Identifierを探す
              if (expression.type === "Identifier") {
                const variableName = expression.name;
                if (variableName.startsWith("_")) {
                  context.report({
                    node: expression,
                    messageId: "local_vars",
                  });
                }
              }
            }
          }
        });
      },
    };
  },
};

/**
 * propsの命名規則
 */
export const suffix: TSESLint.RuleModule<MessageId, []> = {
  meta: {
    type: "problem",
    docs: {
      description: "propsの別名は`xxxProp`という命名にしてください。",
      recommended: "recommended",
      url: "",
    },
    fixable: "code",
    schema: [],
    messages,
  },
  defaultOptions: [],
  create(context) {
    const { filename } = context;
    const isTSX = filename.endsWith(".tsx");
    if (!isTSX) {
      return {};
    }
    return {
      ArrowFunctionExpression(node) {
        node.params.forEach((param) => {
          if (param.type === "ObjectPattern") {
            param.properties.forEach((property) => {
              if (property.type === "Property") {
                const { key, value } = property;
                if (key.type === "Identifier") {
                  if (value.type === "Identifier") {
                    if (key.name === value.name) {
                      return;
                    }
                    if (`${key.name}Prop` !== value.name) {
                      context.report({
                        node: value,
                        messageId: "suffix",
                        // fixer書いてるけど、元の prop name が使われてる箇所までは直せない
                        fix: (fixer) => {
                          return fixer.replaceText(value, `${key.name}Prop`);
                        },
                      });
                    }
                  } else if (value.type === "AssignmentPattern") {
                    if (value.left.type === "Identifier") {
                      if (key.name === value.left.name) {
                        return;
                      }
                      if (`${key.name}Prop` !== value.left.name) {
                        context.report({
                          node: value.left,
                          messageId: "suffix",
                          // fixer書いてるけど、元の prop name が使われてる箇所までは直せない
                          fix: (fixer) => {
                            return fixer.replaceText(
                              value.left,
                              `${key.name}Prop`
                            );
                          },
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        });
      },
      FunctionDeclaration(node) {
        node.params.forEach((param) => {
          if (param.type === "ObjectPattern") {
            param.properties.forEach((property) => {
              if (property.type === "Property") {
                const { key, value } = property;
                if (key.type === "Identifier") {
                  if (value.type === "Identifier") {
                    if (key.name === value.name) {
                      return;
                    }
                    if (`${key.name}Prop` !== value.name) {
                      context.report({
                        node: value,
                        messageId: "suffix",
                        // fixer書いてるけど、元の prop name が使われてる箇所までは直せない
                        fix: (fixer) => {
                          return fixer.replaceText(value, `${key.name}Prop`);
                        },
                      });
                    }
                  } else if (value.type === "AssignmentPattern") {
                    if (value.left.type === "Identifier") {
                      if (key.name === value.left.name) {
                        return;
                      }
                      if (`${key.name}Prop` !== value.left.name) {
                        context.report({
                          node: value.left,
                          messageId: "suffix",
                          // fixer書いてるけど、元の prop name が使われてる箇所までは直せない
                          fix: (fixer) => {
                            return fixer.replaceText(
                              value.left,
                              `${key.name}Prop`
                            );
                          },
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        });
      },
    };
  },
};
