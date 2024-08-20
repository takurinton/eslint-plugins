import { TSESLint } from "@typescript-eslint/utils";
import { MessageId, Options } from "./types";
import { messages } from "./messages";
import { getProperties, haveSameKeys } from "./utils";

const LOCALE_FILE_NAME = "i18n/constants/locale";

/**
 * 言語定数に同じkeyが存在しているかをチェックする
 * @memo 今のところ components しかないので、components の下のソースコードが同じかどうかを見る
 */
export const constantsRule: TSESLint.RuleModule<MessageId, Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "i18n",
      recommended: "recommended",
      url: "",
    },
    schema: [
      {
        type: "object",
        properties: {
          languageConstantVariables: {
            type: "array",
            items: {
              type: "string",
            },
          },
          localeFileName: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
    ],
    messages,
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? context.getFilename() ?? "";

    const localeFileName =
      context.options[0]?.localeFileName ?? LOCALE_FILE_NAME;
    if (filename === "" || !filename.includes(localeFileName)) {
      return {};
    }

    const variableNames = context.options[0]?.languageConstantVariables ?? [];
    const componentsMap = new Map<
      string,
      { properties: unknown; loc: { line: number; column: number } }
    >();

    return {
      VariableDeclaration(node) {
        if (node.declarations.length === 0) {
          return;
        }

        // variableName と同じ名前の変数を取得
        if (node.declarations[0].id.type === "Identifier") {
          const variableName = node.declarations[0].id.name;
          if (variableNames.includes(variableName)) {
            if (node.declarations[0].init?.type === "ObjectExpression") {
              const componentsKeyNode =
                node.declarations[0].init.properties.find(
                  (property) =>
                    property.type === "Property" &&
                    property.key.type === "Identifier" &&
                    property.key.name === "components",
                );

              if (
                componentsKeyNode == null ||
                componentsKeyNode.type !== "Property"
              ) {
                return;
              }

              if (componentsKeyNode.value.type === "ObjectExpression") {
                const properties = getProperties(componentsKeyNode.value);
                componentsMap.set(variableName, {
                  properties,
                  loc: node.loc.start,
                });
              }
            }
            if (
              node.declarations[0].init?.type === "TSAsExpression" &&
              node.declarations[0].init.expression.type === "ObjectExpression"
            ) {
              const componentsKeyNode =
                node.declarations[0].init.expression.properties.find(
                  (property) =>
                    property.type === "Property" &&
                    property.key.type === "Identifier" &&
                    property.key.name === "components",
                );

              if (
                componentsKeyNode == null ||
                componentsKeyNode.type !== "Property"
              ) {
                return;
              }

              if (componentsKeyNode.value.type === "ObjectExpression") {
                const properties = getProperties(componentsKeyNode.value);
                componentsMap.set(variableName, {
                  properties,
                  loc: node.loc.start,
                });
              }
            }
          }
        }
      },
      "Program:exit"() {
        const componentsKeys = Array.from(componentsMap.keys());
        if (componentsKeys.length !== variableNames.length) {
          return;
        }

        if (!haveSameKeys(componentsMap)) {
          context.report({
            // 基本的にnullになることはない
            loc: componentsMap.get(componentsKeys[0])?.loc ?? {
              line: 1,
              column: 0,
            },
            messageId: "missing_key_value",
          });
        }
      },
    };
  },
};

/**
 * 言語定数を定義するためのルール
 * languageConstantVariables に指定された定数名を定義しているかをチェックする
 * 定数はオブジェクトで、少なくともcomponentsというkeyを持つ必要がある
 */
export const defineLanguageConstantVariables: TSESLint.RuleModule<
  MessageId,
  Options
> = {
  meta: {
    type: "problem",
    docs: {
      description: "i18n",
      recommended: "recommended",
      url: "",
    },
    schema: [
      {
        type: "object",
        properties: {
          languageConstantVariables: {
            type: "array",
            items: {
              type: "string",
            },
          },
          localeFileName: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
    ],
    messages,
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? context.getFilename() ?? "";
    const _localeFilename =
      context.options[0]?.localeFileName ?? LOCALE_FILE_NAME;

    if (filename === "" || !filename.includes(_localeFilename)) {
      return {};
    }

    const variableNames = context.options[0]?.languageConstantVariables ?? [];
    const definedVairableNames: {
      variableName: (typeof variableNames)[number];
      hasComponentsKey: boolean;
      loc: { line: number; column: number };
    }[] = [];

    return {
      VariableDeclaration(node) {
        if (node.declarations.length === 0) {
          return;
        }

        if (node.declarations[0].id.type === "Identifier") {
          const variableName = node.declarations[0].id.name;
          if (variableNames.includes(variableName)) {
            if (node.declarations[0].init?.type === "ObjectExpression") {
              const hasComponentsKey =
                node.declarations[0].init.properties.some(
                  (property) =>
                    property.type === "Property" &&
                    property.key.type === "Identifier" &&
                    property.key.name === "components",
                );
              definedVairableNames.push({
                variableName,
                hasComponentsKey,
                loc: node.loc.start,
              });
            }
          }
        }
        if (node.declarations[0].init?.type === "TSAsExpression") {
          if (node.declarations[0].id.type === "Identifier") {
            const variableName = node.declarations[0].id.name;
            if (variableNames.includes(variableName)) {
              if (
                node.declarations[0].init?.expression.type ===
                "ObjectExpression"
              ) {
                const hasComponentsKey =
                  node.declarations[0].init.expression.properties.some(
                    (property) =>
                      property.type === "Property" &&
                      property.key.type === "Identifier" &&
                      property.key.name === "components",
                  );
                definedVairableNames.push({
                  variableName,
                  hasComponentsKey,
                  loc: node.loc.start,
                });
              }
            }
          }
        }
      },
      "Program:exit"() {
        // エラーはひとまず1行目に出す
        const definedVariableNameKeys = definedVairableNames.map(
          (variableName) => variableName.variableName,
        );

        if (definedVariableNameKeys.length !== variableNames.length) {
          const missingVariableNames = variableNames.filter(
            (variableName) => !definedVariableNameKeys.includes(variableName),
          );
          for (const missingVariableName of missingVariableNames) {
            context.report({
              loc: { line: 1, column: 0 },
              messageId: "missing_language",
              data: {
                lang: missingVariableName,
              },
            });
          }
        }

        for (const definedVairableName of definedVairableNames) {
          const { variableName, hasComponentsKey, loc } = definedVairableName;
          if (!hasComponentsKey) {
            context.report({
              loc,
              messageId: "missgin_components_key",
              data: {
                lang: variableName,
              },
            });
          }
        }
      },
    };
  },
};
