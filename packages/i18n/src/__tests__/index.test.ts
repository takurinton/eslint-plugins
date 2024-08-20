import { constantsRule, defineLanguageConstantVariables } from "../rules";
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

ruleTester.run("i18n/constants", constantsRule, {
  valid: [
    {
      filename: "i18n/constants/locale.ts",
      code: `
        export const en = {
          components: {
            Button: {
              defaultProps: {},
            },
          },
        } as const

        export const ja = {
          components: {
            Button: {
              defaultProps: {},
            },
          },
        } as const`,
      options: [
        {
          languageConstantVariables: ["ja", "en"],
        },
      ],
    },
    {
      filename: "i18n/constants/locale.ts",
      code: `
        export const en = {
          components: {
            Button: {
              defaultProps: {
                placeholder: "value",
                key: "value",
              },
            },
          },
        } as const

        export const ja = {
          components: {
            Button: {
              defaultProps: {
                placeholder: "value",
                key: "value",
              },
            },
          },
        } as const`,
      options: [
        {
          languageConstantVariables: ["ja", "en"],
        },
      ],
    },
    {
      filename: "localeFile.ts",
      code: `
        export const en = {
          components: {
            Button: {
              defaultProps: {},
            },
          },
        } as const

        export const ja = {
          components: {
            Button: {
              defaultProps: {},
            },
          },
        } as const`,
      options: [
        {
          languageConstantVariables: ["ja", "en"],
          localeFileName: "localeFile",
        },
      ],
    },
  ],
  invalid: [
    {
      filename: "i18n/constants/locale.ts",
      code: `
        export const en = {
          components: {
            Button: {
              defaultProps: {},
            },
          },
        } as const

        export const ja = {
          components: {
            Button: {
              defaultProps: {
                key: "value",
              },
            },
          },
        } as const`,
      options: [
        {
          languageConstantVariables: ["ja", "en"],
        },
      ],
      errors: [
        {
          messageId: "missing_key_value",
          data: {
            key: "Button.defaultProps",
          },
        },
        {
          messageId: "missing_key_value",
          data: {
            key: "Button.defaultProps.key",
          },
        },
      ],
    },
    {
      filename: "i18n/constants/locale.ts",
      code: `
        export const en = {
          components: {
            Button: {
              defaultProps: {},
            },
            Input: {
              defaultProps: {},
            },
          },
        } as const

        export const ja = {
          components: {
            Button: {
              defaultProps: {
                key: "value",
              },
            },
            Input: {
              defaultProps: {},
            },
          },
        } as const`,
      options: [
        {
          languageConstantVariables: ["ja", "en"],
        },
      ],
      errors: [
        {
          messageId: "missing_key_value",
          data: {
            key: "Button.defaultProps",
          },
        },
        {
          messageId: "missing_key_value",
          data: {
            key: "Button.defaultProps.key",
          },
        },
      ],
    },
    {
      filename: "i18n/constants/locale.ts",
      code: `
        export const en = {
          components: {
            Button: {
              defaultProps: {
                key: "value",
              },
            },
          },
        } as const

        export const ja = {
          components: {
            Button: {
              defaultProps: {
                key: "value",
              },
            },
            Input: {
              defaultProps: {},
            },
          },
        } as const`,
      options: [
        {
          languageConstantVariables: ["ja", "en"],
        },
      ],
      errors: [
        {
          messageId: "missing_key_value",
          data: {
            key: "Input.defaultProps",
          },
        },
      ],
    },
  ],
});

ruleTester.run(
  "i18n/define-language-constant-variables",
  defineLanguageConstantVariables,
  {
    valid: [
      {
        filename: "i18n/constants/locale.ts",
        code: `
          export const ja = {
            components: {},
          };
          export const en = {
            components: {},
          };
        `,
        options: [
          {
            languageConstantVariables: ["ja", "en"],
          },
        ],
      },
      {
        filename: "i18n/constants/locale.ts",
        code: `
          export const ja = {
            components: {
              Button: {
                defaultProps: {},
              },
            },
          };
          export const en = {
            components: {
              Button: {
                defaultProps: {},
              },
            },
          };
        `,
        options: [
          {
            languageConstantVariables: ["ja", "en"],
          },
        ],
      },
      {
        filename: "localeFile.ts",
        code: `
          export const en = {
            components: {
              Button: {
                defaultProps: {},
              },
            },
          } as const

          export const ja = {
            components: {
              Button: {
                defaultProps: {},
              },
            },
          } as const`,
        options: [
          {
            languageConstantVariables: ["ja", "en"],
            localeFileName: "localeFile",
          },
        ],
      },
    ],
    invalid: [
      {
        filename: "i18n/constants/locale.ts",
        code: `
          export const ja = {
            components: {},
          };
          export const en = {
            components: {},
          };
        `,
        options: [
          {
            languageConstantVariables: ["ja", "en", "zh"],
          },
        ],
        errors: [
          {
            messageId: "missing_language",
            data: {
              lang: "zh",
            },
          },
        ],
      },
      {
        filename: "i18n/constants/locale.ts",
        code: `
          export const ja = {};
          export const en = {};
        `,
        options: [
          {
            languageConstantVariables: ["ja", "en"],
          },
        ],
        errors: [
          {
            messageId: "missgin_components_key",
            data: {
              lang: "ja",
            },
          },
          {
            messageId: "missgin_components_key",
            data: {
              lang: "en",
            },
          },
        ],
      },
    ],
  },
);
