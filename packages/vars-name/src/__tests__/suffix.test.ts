import { suffix } from "../rules";
import { afterAll, describe, it } from "vitest";
import { RuleTester } from "@typescript-eslint/rule-tester";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("vars-name/suffix", suffix, {
  valid: [
    // propsの別名は`xxxProp`という命名にする(arrow function)
    {
      filename: "Component.tsx",
      code: "const Component = ({ name: nameProp }: { name: string }) => <div>{nameProp}</div>;",
    },
    // propsの別名は`xxxProp`という命名にする(function)
    {
      filename: "Component.tsx",
      code: "function Component({ name: nameProp }: { name: string }) { return <div>{nameProp}</div>; }",
    },
    // 別名をつけていないときは対象外(arrow function)
    {
      filename: "Component.tsx",
      code: "function Component({ name }: { name: string }) { return <div>{name}</div>; }",
    },
    // 別名をつけていないときは対象外(function)
    {
      filename: "Component.tsx",
      code: "function Component({ name }: { name: string }) { return <div>{name}</div>; }",
    },
    // 別名とkeyの名前が同じときは対象外(arrow function)
    {
      filename: "Component.tsx",
      code: "function Component({ name: name }: { name: string }) { return <div>{name}</div>; }",
    },
    // 別名とkeyの名前が同じときは対象外(function)
    {
      filename: "Component.tsx",
      code: "function Component({ name: name }: { name: string }) { return <div>{name}</div>; }",
    },
    // デフォルト値を入れている場合(arrow function)
    {
      filename: "Component.tsx",
      code: "const Component = ({ name = 'foo' }: { name: string }) => <div>{name}</div>;",
    },
    // デフォルト値を入れている場合(function)
    {
      filename: "Component.tsx",
      code: "function Component({ name = 'foo' }: { name: string }) { return <div>{name}</div>; }",
    },
    // .tsファイルは対象外
    {
      filename: "foo.ts",
      code: "const foo = ({ name: foo }: { name: string }) => foo;",
    },
  ],
  invalid: [
    // propsの別名が`xxxProp`という命名になっていない(arrow function)
    // {
    //   filename: "Component.tsx",
    //   code: "const Component = ({ name: foo }: { name: string }) => <div>{foo}</div>;",
    //   errors: [
    //     {
    //       messageId: "suffix",
    //     },
    //   ],
    // },
    // propsの別名が`xxxProp`という命名になっていない(function)
    // {
    //   filename: "Component.tsx",
    //   code: "function Component({ name: foo }: { name: string }) { return <div>{foo}</div>; }",
    //   errors: [
    //     {
    //       messageId: "suffix",
    //     },
    //   ],
    // },

    // fixable(arrow function)
    // fixer書いてるけど、元の prop name が使われてる箇所までは直せない
    {
      filename: "Component.tsx",
      code: "const Component = ({ name: foo }: { name: string }) => <div>{foo}</div>;",
      output:
        "const Component = ({ name: nameProp }: { name: string }) => <div>{foo}</div>;",
      errors: [
        {
          messageId: "suffix",
        },
      ],
    },
    // fixable(function)
    // fixer書いてるけど、元の prop name が使われてる箇所までは直せない
    {
      filename: "Component.tsx",
      code: "function Component({ name: foo }: { name: string }) { return <div>{foo}</div>; }",
      output:
        "function Component({ name: nameProp }: { name: string }) { return <div>{foo}</div>; }",
      errors: [
        {
          messageId: "suffix",
        },
      ],
    },
    // デフォルト値を入れている場合(arrow function)
    {
      filename: "Component.tsx",
      code: "const Component = ({ name: _name = 'foo' }: { name: string }) => <div>{_name}</div>;",
      output:
        "const Component = ({ name: nameProp = 'foo' }: { name: string }) => <div>{_name}</div>;",
      errors: [
        {
          messageId: "suffix",
        },
      ],
    },
    // デフォルト値を入れている場合(function)
    {
      filename: "Component.tsx",
      code: "function Component({ name: _name = 'foo' }: { name: string }) { return <div>{_name}</div>; }",
      output:
        "function Component({ name: nameProp = 'foo' }: { name: string }) { return <div>{_name}</div>; }",
      errors: [
        {
          messageId: "suffix",
        },
      ],
    },
  ],
});
