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

export const findMismatchedPropertiesKeys = (
  map: Map<
    string,
    {
      properties: Record<string, unknown>;
    }
  >,
): string[] | null => {
  const extractDeepestKeys = (
    obj: Record<string, unknown>,
    prefix = "",
  ): string[] => {
    const keys = Object.keys(obj);
    return keys.flatMap((key) => {
      const value = obj[key];
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        const nestedKeys = extractDeepestKeys(
          value as Record<string, unknown>,
          newPrefix,
        );
        return nestedKeys.length > 0 ? nestedKeys : [newPrefix];
      }
      return [newPrefix];
    });
  };

  const keysArray = Array.from(map.values()).map((value) =>
    extractDeepestKeys(value.properties),
  );

  if (keysArray.length === 0) return null;

  const allKeys = new Set(keysArray.flat());
  const mismatchedKeys: string[] = [];

  for (const key of allKeys) {
    const isPresentInAll = keysArray.every((keys) => keys.includes(key));
    if (!isPresentInAll) {
      mismatchedKeys.push(key);
    }
  }

  return mismatchedKeys.length > 0 ? mismatchedKeys : null;
};
