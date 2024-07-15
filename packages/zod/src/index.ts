import { zodNumber, zodString, zodUtilRules } from "./rules";

export = {
  rules: {
    number: zodNumber,
    string: zodString,
    utils: zodUtilRules,
  },
  configs: {
    all: {
      plugins: ["zod"],
      rules: {
        "zod/number": "error",
        "zod/string": "error",
        "zod/utils": "error",
      },
    },
  },
};
