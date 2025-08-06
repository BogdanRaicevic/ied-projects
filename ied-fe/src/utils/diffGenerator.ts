import { type Change, diffWordsWithSpace } from "diff";
import { isEqual } from "lodash";

export interface IChange {
    kind: "N" | "D" | "E" | "T"; // New, Deleted, Edited, Text
    property: string;
    oldValue?: any;
    newValue?: any;
    diff?: Change[];
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
                if (key === "komentar" && typeof oldValue === "string" && typeof newValue === "string") {
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
