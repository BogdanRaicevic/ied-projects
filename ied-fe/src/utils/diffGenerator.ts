import { diffWordsWithSpace } from "diff";
import { isEqual } from "es-toolkit";
import type { IArrayChange, IChange } from "ied-shared";

export const generateStructuredDiff = (
  before: any,
  after: any,
): IChange[] | null => {
  const changes: IChange[] = [];
  const beforeObj = before || {};
  const afterObj = after || {};

  const allKeys = new Set([
    ...Object.keys(beforeObj),
    ...Object.keys(afterObj),
  ]);

  for (const key of allKeys) {
    // Skip metadata fields
    if (key === "updated_at" || key === "__v" || key === "created_at") {
      continue;
    }
    const oldValue = beforeObj[key];
    const newValue = afterObj[key];

    if (!isEqual(oldValue, newValue)) {
      if (!Object.hasOwn(beforeObj, key)) {
        changes.push({ kind: "N", property: key, newValue });
      } else if (!Object.hasOwn(afterObj, key)) {
        changes.push({ kind: "D", property: key, oldValue });
      } else {
        if (
          (key === "zaposleni" || key === "prijave") &&
          Array.isArray(oldValue) &&
          Array.isArray(newValue)
        ) {
          const arrayChanges: IArrayChange[] = [];
          const uniqueKey = "_id";

          const beforeMap = new Map(
            oldValue.map((item) => [item[uniqueKey], item]),
          );
          const afterMap = new Map(
            newValue.map((item) => [item[uniqueKey], item]),
          );

          // Pronađi izmenjene i obrisane
          for (const [id, item] of beforeMap.entries()) {
            if (!afterMap.has(id)) {
              arrayChanges.push({ type: "removed", id, item });
            } else {
              const newItem = afterMap.get(id);
              // Rekurzivni poziv za objekat zaposlenog!
              const itemChanges = generateStructuredDiff(item, newItem);
              if (itemChanges) {
                arrayChanges.push({
                  type: "modified",
                  id,
                  changes: itemChanges,
                  item: newItem,
                });
              }
            }
          }

          // Pronađi dodate
          for (const [id, item] of afterMap.entries()) {
            if (!beforeMap.has(id)) {
              arrayChanges.push({ type: "added", id, item });
            }
          }

          if (arrayChanges.length > 0) {
            changes.push({ kind: "A", property: key, arrayChanges });
          }
        } else if (key === "komentar") {
          changes.push({
            kind: "T",
            property: key,
            diff: diffWordsWithSpace(oldValue ?? "", newValue ?? ""),
          });
        } else {
          changes.push({
            kind: "E",
            property: key,
            oldValue,
            newValue,
          });
        }
      }
    }
  }

  return changes.length > 0 ? changes : null;
};
