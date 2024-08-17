import { TSESTree } from "@typescript-eslint/utils";

/**
 * TSESTreeから全てのプロパティを取得し、object にする
 * 型の都合でこうしているが、基本的に入ってくるのは object か string なので、それ以外は早期returnしてしまてオッケー
 */
export const getProperties = (
  node: TSESTree.Node,
): TSESTree.Node | string | null => {
  if (node.type === "ObjectExpression") {
    return node.properties.reduce(
      (acc, property) => {
        if (property.type === "Property") {
          if (property.key.type === "Identifier") {
            acc[property.key.name] = getProperties(property.value);
          } else {
            return null;
          }
        } else {
          return null;
        }
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );
  } else if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  return null;
};

export const haveSameKeys = (map: Map<string, unknown>): boolean => {
  const extractKeys = (obj: unknown): string[] => {
    if (typeof obj !== "object" || obj === null) return [];

    const keys = Object.keys(obj as object);
    return keys.flatMap((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nestedKeys = extractKeys((obj as any)[key]);
      return nestedKeys.length > 0
        ? nestedKeys.map((nestedKey) => `${key}.${nestedKey}`)
        : key;
    });
  };

  const keysArray = Array.from(map.values()).map(extractKeys);

  if (keysArray.length === 0) return false;

  const baseKeys = keysArray[0];

  return keysArray.every(
    (keys) =>
      keys.length === baseKeys.length &&
      keys.every((key) => baseKeys.includes(key)),
  );
};
