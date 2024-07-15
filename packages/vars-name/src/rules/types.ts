export type MessageId = "local_vars" | "suffix";

export type Messages = {
  [key in MessageId]: string;
};
