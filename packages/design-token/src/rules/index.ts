import { TSESLint } from "@typescript-eslint/utils";
import styledSystem from "styled-system";
import ignore from "ignore";
import path from "path";
import { MessageId, Options } from "./types";
import { messages } from "./messages";

const defaultThemePropKeys = [
  "margin",
  "padding",
  "space",
  "zIndex",
  "top",
  "right",
  "bottom",
  "left",
  "typography",
  "background",
  "borderRadius",
  "sizes",
  "fontSizes",
  "colors",
  "fontWeights",
];

const initialValues = [
  // 初期値に戻す
  "initial",
  "inherit",
  "unset",
  "revert",
  "auto",
  "revert",
  "revert-layer",
  "all",

  // 透明
  "transparent",
];

type PropertyKeys = keyof Omit<
  typeof styledSystem,
  | "get"
  | "compose"
  | "system"
  | "style"
  | "createParser"
  | "createStyleFunction"
  | "variant"
  | "getPx"
  | "styles"
>;
const styledSystemKeys = Object.keys(styledSystem) as PropertyKeys[];

const getPropNames = (onlyCheckDefaultTheme: boolean): (string | undefined)[] =>
  styledSystemKeys
    .map((key) => {
      if (onlyCheckDefaultTheme && !defaultThemePropKeys.includes(key)) {
        return undefined;
      }
      return styledSystem[key].propNames;
    })
    .filter((propNames) => propNames !== undefined)
    .flat();

/**
 * デザイントークンを使ってください！
 */
export const useDesignToken: TSESLint.RuleModule<MessageId, Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "デザイントークンを使ってください！",
      recommended: "recommended",
      url: "",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreFilenames: {
            type: "array",
            items: {
              type: "string",
            },
          },
          ignoreKeys: {
            type: "array",
            items: {
              type: "string",
            },
          },
          onlyCheckDefaultTheme: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages,
  },
  defaultOptions: [],
  create(context) {
    const { filename: _filename, options, getFilename } = context;
    const ignoreFilenames = options[0]?.ignoreFilenames ?? [];
    const basePath = process.cwd();
    /**
     * typescript-eslint のバージョン違いで filename が取得できない場合があるので
     * getFilename でも取得する
     */
    const filename = _filename ?? getFilename();
    const file = path.relative(basePath, filename);
    const ig = ignore().add(ignoreFilenames);
    if (ig.ignores(file)) {
      return {};
    }

    const onlyCheckDefaultTheme = options[0]?.onlyCheckDefaultTheme ?? false;
    const propNames = getPropNames(onlyCheckDefaultTheme);

    return {
      JSXOpeningElement(node) {
        node.attributes.forEach((attribute) => {
          if (attribute.type === "JSXAttribute") {
            const value = attribute.value;

            const key = attribute.name.name;
            if (value?.type === "Literal") {
              const ignoreKeys = options[0]?.ignoreKeys ?? [];
              const ig = ignore().add(ignoreKeys);
              if (typeof key === "string" && ig.ignores(key)) {
                return;
              }

              if (
                typeof value.value === "string" &&
                initialValues.includes(value.value)
              ) {
                return;
              }

              if (typeof key === "string" && propNames.includes(key)) {
                context.report({
                  node: value,
                  messageId: "use_design_token",
                });
              }
            }

            if (value && value.type === "JSXExpressionContainer") {
              const expression = value.expression;
              if (
                expression.type === "MemberExpression" &&
                expression.object.type === "MemberExpression" &&
                expression.object.object.type === "Identifier"
              ) {
                const variableName = expression.object.object.name;
                if (initialValues.includes(variableName)) {
                  return;
                }
                if (!variableName.startsWith("theme")) {
                  context.report({
                    node: expression,
                    messageId: "use_design_token",
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
