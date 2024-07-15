import { localVars } from "../rules";
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

ruleTester.run("vars-name/local-vars", localVars, {
  valid: [
    // コンポーネントのpropsに`_`が先頭についていない場合は渡すことができる(arrow function)
    {
      filename: "Component.tsx",
      code: `
        const Component = ({ name }: { name: string }) => { return <div>{name}</div>; };
        const name = "foo";
        <Component name={name} />
        `,
    },
    // コンポーネントのpropsに`_`が先頭についていない場合は渡すことができる(function)
    {
      filename: "Component.tsx",
      code: `
        function Component({ name }: { name: string }) { return <div>{name}</div>; };
        const name = "foo";
        <Component name={name} />
        `,
    },
    // .tsファイルは対象外
    {
      filename: "foo.ts",
      code: `
        const foo = ({ name }: { name: string }) => name;
        const _name = "foo";
        foo({ name: _name })
        `,
    },
  ],
  invalid: [
    // コンポーネントのpropsに`_`が先頭についている変数は渡すことができない(arrow function)
    {
      filename: "Component.tsx",
      code: `
          const Component = ({ name }: { name: string }) => { return <div>{name}</div>; };
          const _name = "foo";
          <Component name={_name} />
      `,
      errors: [
        {
          messageId: "local_vars",
        },
      ],
    },
    // コンポーネントのpropsに`_`が先頭についている変数は渡すことができない(function)
    {
      filename: "Component.tsx",
      code: `
          const Component = ({ name }: { name: string }) => { return <div>{name}</div>; };
          const _name = "foo";
          <Component name={_name} />
          `,
      errors: [
        {
          messageId: "local_vars",
        },
      ],
    },
    // コンポーネントのpropsに`_`が先頭についている関数は渡すことができない(arrow function)
    {
      filename: "Component.tsx",
      code: `
          const Component = ({ name }: { name: string }) => { return <div>{name}</div>; };
          const _foo = () => {};
          <Component name={_foo} />
      `,
      errors: [
        {
          messageId: "local_vars",
        },
      ],
    },
    // コンポーネントのpropsに`_`が先頭についている関数は渡すことができない(function)
    {
      filename: "Component.tsx",
      code: `
          const Component = ({ name }: { name: string }) => { return <div>{name}</div>; };
          const _foo = () => {};
          <Component name={_foo} />
          `,
      errors: [
        {
          messageId: "local_vars",
        },
      ],
    },
  ],
});
