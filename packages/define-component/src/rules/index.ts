import { TSESLint } from "@typescript-eslint/utils";
import { isInsideFunctionScope } from "./utils";

export type Errors = "not_react_component_error" | "variable_declaration_error";

type Messages = {
  [key in Errors]: string;
};

const messages: Messages = {
  not_react_component_error:
    "React コンポーネント以外の関数を定義しないでください。",
  variable_declaration_error: "定数または関数は別ファイルに分割してください。",
} as const;

export const rule: TSESLint.RuleModule<Errors, []> = {
  meta: {
    type: "suggestion",
    docs: {
      description: "",
      url: "",
    },
    messages,
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const filename = context.getFilename();
    const basename = filename.split("/")[filename.split("/").length - 1];
    if (
      // tsx ファイルでない場合は無視
      !filename.endsWith(".tsx") ||
      // storybook のファイルは無視
      filename.endsWith(".stories.tsx") ||
      // ファイル名が use から始まる場合は無視、useXXX.tsx のようなものを想定
      basename.startsWith("use")
    ) {
      return {};
    }

    return {
      // forwardRef を使った React コンポーネントの定義は許可
      CallExpression: (node) => {
        if (
          node.callee.type !== "MemberExpression" ||
          node.callee.object.type !== "Identifier" ||
          // node.callee.object.name !== "React" ||
          node.callee.property.type !== "Identifier" ||
          node.callee.property.name !== "forwardRef" ||
          node.arguments.length === 0
        ) {
          return;
        }

        // React.forwardRefの第一引数を取得
        const componentFunction = node.arguments[0];

        // 第一引数が関数でなければ早期リターン
        if (
          componentFunction.type !== "FunctionExpression" &&
          componentFunction.type !== "ArrowFunctionExpression"
        ) {
          return;
        }

        const isReactComponent =
          componentFunction.body.type === "BlockStatement" &&
          componentFunction.body.body.length > 0 &&
          componentFunction.body.body.some(
            (statement) =>
              statement.type === "ReturnStatement" &&
              statement.argument &&
              statement.argument.type === "JSXElement",
          );

        if (!isReactComponent) {
          context.report({
            node,
            messageId: "not_react_component_error",
          });
        }
      },
      // 変数・定数の宣言は拒否
      VariableDeclaration: (node) => {
        // 右辺が関数であれば早期リターン
        if (
          node.declarations[0].init?.type === "ArrowFunctionExpression" ||
          node.declarations[0].init?.type === "FunctionExpression"
        ) {
          return;
        }

        if (isInsideFunctionScope(context)) {
          return;
        }

        if (
          node.declarations[0].init?.type === "CallExpression" &&
          ((node.declarations[0].init.callee.type === "MemberExpression" &&
            node.declarations[0].init.callee.object.type === "Identifier" &&
            node.declarations[0].init.callee.property.type === "Identifier" &&
            (node.declarations[0].init.callee.property.name === "forwardRef" ||
              node.declarations[0].init.callee.property.name === "memo")) ||
            (node.declarations[0].init.callee.type === "Identifier" &&
              (node.declarations[0].init.callee.name === "forwardRef" ||
                node.declarations[0].init.callee.name === "memo")))
        ) {
          return;
        }

        context.report({
          node,
          messageId: "variable_declaration_error",
        });
      },
      // function 宣言、function 式を使った React コンポーネントの定義は許可
      // function 宣言は拒否
      FunctionDeclaration: (node) => {
        if (isInsideFunctionScope(context)) {
          return;
        }

        const isReactComponent =
          node.body.type === "BlockStatement" &&
          node.body.body.length > 0 &&
          node.body.body.some(
            (statement) =>
              statement.type === "ReturnStatement" &&
              statement.argument &&
              (statement.argument.type === "JSXElement" ||
                statement.argument.type === "JSXFragment"),
          );

        if (!isReactComponent) {
          context.report({
            node,
            messageId: "not_react_component_error",
          });
        }
      },
      // アロー関数を使った React コンポーネントの定義は許可
      // アロー関数式は拒否
      ArrowFunctionExpression: (node) => {
        if (isInsideFunctionScope(context)) {
          return;
        }

        const isReactComponent =
          node.body.type === "JSXElement" ||
          node.body.type === "JSXFragment" ||
          (node.body.type === "BlockStatement" &&
            node.body.body.length > 0 &&
            node.body.body.some(
              (statement) =>
                statement.type === "ReturnStatement" &&
                statement.argument &&
                (statement.argument.type === "JSXElement" ||
                  statement.argument.type === "JSXFragment"),
            )) ||
          // 三項演算子を使っている場合
          (node.body.type === "ConditionalExpression" &&
            (node.body.consequent.type === "JSXElement" ||
              node.body.alternate.type === "JSXElement"));

        if (!isReactComponent) {
          context.report({
            node,
            messageId: "not_react_component_error",
          });
        }
      },
    };
  },
};
