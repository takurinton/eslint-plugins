import { localVars, suffix } from "./rules";

export = {
  rules: {
    "local-vars": localVars,
    suffix,
  },
  configs: {
    all: {
      plugins: ["vars-name"],
      rules: {
        "vars-name/local-vars": "error",
        "vars-name/suffix": "error",
      },
    },
  },
};
