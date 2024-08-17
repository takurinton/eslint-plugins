import { constantsRule } from "./rules";

export = {
  rules: {
    constants: constantsRule,
  },
  configs: {
    all: {
      plugins: ["i18n"],
      rules: {
        "i18n/constants": "error",
      },
    },
  },
};
