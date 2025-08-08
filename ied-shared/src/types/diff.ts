import type { Change } from "diff";

export type IArrayChange = {
  type: "added" | "removed" | "modified";
  id: string | number;
  item?: any;
  changes?: IChange[] | null;
};

type NewChange = {
  kind: "N";
  property: string;
  newValue: any;
};

type DeletedChange = {
  kind: "D";
  property: string;
  oldValue: any;
};

type EditedChange = {
  kind: "E";
  property: string;
  oldValue: any;
  newValue: any;
};

type TextChange = {
  kind: "T";
  property: string;
  diff: Change[];
};

type ArrayChange = {
  kind: "A";
  property: string;
  arrayChanges: IArrayChange[];
};

export type IChange = NewChange | DeletedChange | EditedChange | TextChange | ArrayChange;
