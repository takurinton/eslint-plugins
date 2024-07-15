import { rule } from "./rules";

export = {
  rules: {
    "only-define-react-component": rule,
  },
  configs: {
    all: {
      plugins: ["only-define-react-component"],
      rules: {
        "only-define-react-component/only-define-react-component": "error",
      },
    },
  },
};
