import { type Change, diffWordsWithSpace } from "diff";
import { isEqual } from "es-toolkit";

export interface IChange {
  kind: "N" | "D" | "E" | "T" | "A"; // New, Deleted, Edited, Text, Array
  property: string;
  oldValue?: any;
  newValue?: any;
  diff?: Change[];
  arrayChanges?: IArrayChange[]; // For array changes
}

export interface IArrayChange {
  type: "added" | "removed" | "modified";
  id: string | number;
  item?: any;
  changes?: IChange[] | null;
}

export const generateStructuredDiff = (before: any, after: any): IChange[] | null => {
  const changes: IChange[] = [];
  const beforeObj = before || {};
  const afterObj = after || {};

  const allKeys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);

  for (const key of allKeys) {
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

          const beforeMap = new Map(oldValue.map((item) => [item[uniqueKey], item]));
          const afterMap = new Map(newValue.map((item) => [item[uniqueKey], item]));

          // Pronađi izmenjene i obrisane
          for (const [id, item] of beforeMap.entries()) {
            if (!afterMap.has(id)) {
              arrayChanges.push({ type: "removed", id, item });
            } else {
              const newItem = afterMap.get(id);
              // Rekurzivni poziv za objekat zaposlenog!
              const itemChanges = generateStructuredDiff(item, newItem);
              if (itemChanges) {
                arrayChanges.push({ type: "modified", id, changes: itemChanges, item: newItem });
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
            diff: diffWordsWithSpace(oldValue, newValue),
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
