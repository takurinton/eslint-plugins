import path from "path";
import { rule } from "../rules";
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

ruleTester.run("eslint-plugin-only-define-react-component", rule, {
  valid: [
    {
      code: `
        import React from "react";

        const Component = () => {
          return <div>Hello World</div>;
        };
      `,
      filename: "file.tsx",
    },
    {
      code: `
        const useHoge = () => {};
      `,
      filename: "useHoge.tsx",
    },
    {
      code: `
        import React from "react";

        const Component = () => {
          const [state, setState] = useState(0);
          
          return <div>Hello World</div>;
        };
      `,
      filename: "file.tsx",
    },
    {
      code: `
        const Button = React.forwardRef<HTMLElement, Props>(
          function Button({ ...rest }, ref): React.ReactElement {
            return (
              <BaseButton ref={ref} {...rest}>
                {children}
              </BaseButton>
            )
          },
        )
      `,
      filename: "file.tsx",
    },
    {
      code: `
        // for chakra-ui forwardRef
        import { forwardRef } from '@chakra-ui/react'

        const Button: React.FC<Props> = forwardRef(
          ({ children, ...rest }, ref): React.ReactElement => (
            <BaseButton
              ref={ref}
              {...rest}
            >
              {children}
            </BaseButton>
          ),
        )
      `,
      filename: "file.tsx",
    },
    {
      code: `
        import React from "react";

        export const Container = ({ children }: { children: React.ReactNode | undefined }): React.ReactElement | null =>
          children !== undefined ? (
            <Box>
              {children}
            </Box>
          ) : null
      `,
      filename: "file.tsx",
    },
    {
      code: `
        import React from "react";

        function Component() {
          return <div>Hello World</div>;
        };
      `,
      filename: "file.tsx",
    },
    {
      code: `
        import * as React from 'react'

        const App: React.FC = () => {
          return <>react</>
        }
        
        export default App
      `,
      filename: "file.tsx",
    },
    {
      code: `
        import React from "react";

        function Component() {
          return <div>Hello World</div>;
        };

        const MemoizedComponent = React.memo(Component);
      `,
      filename: "file.tsx",
    },
    {
      code: `
      const variable = 123;
      `,
      filename: "file.ts",
    },
    {
      code: `
      const variable = 123;
      `,
      filename: "file.stories.tsx",
    },
  ],
  invalid: [
    {
      code: `
        const variable = 123;
      `,
      filename: "file.tsx",
      errors: [
        {
          messageId: "variable_declaration_error",
        },
      ],
    },
    {
      code: `
        function functionDeclaration() {
          console.log("Not a React Component");
        };
      `,
      filename: "file.tsx",
      errors: [
        {
          messageId: "not_react_component_error",
        },
      ],
    },
    {
      code: `
        const arrowFunctionExpression = () => {
          console.log("Not a React Component");
        };
      `,
      filename: "file.tsx",
      errors: [
        {
          messageId: "not_react_component_error",
        },
      ],
    },
  ],
});
