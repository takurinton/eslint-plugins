import { constantsRule, defineLanguageConstantVariables } from "./rules";

export = {
  rules: {
    constants: constantsRule,
    defineLanguageConstantVariables,
  },
  configs: {
    all: {
      plugins: ["i18n"],
      rules: {
        "i18n/constants": "error",
        "i18n/define-language-constant-variables": "error",
      },
    },
  },
};
