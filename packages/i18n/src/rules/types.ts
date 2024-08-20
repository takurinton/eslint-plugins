export type MessageId =
  | "missing_key_value"
  | "missing_language"
  | "missgin_components_key";

export type Messages = {
  [key in MessageId]: string;
};

export type Options = Array<{
  languageConstantVariables?: string[];
  /**
   * @memo gitignoreの記法で書くことができるようにしてもいいかも
   */
  localeFileName?: string;
}>;
