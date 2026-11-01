import { format } from "date-fns";
import type { SeminarZodType } from "ied-shared";
import type { DataTableColumn } from "../DataTable/DataTable";
import SeminariTableActionCell from "./SeminariTableActionCell";

export const getSeminariColumns = (
  onEdit: (seminar: SeminarZodType) => void,
): DataTableColumn<SeminarZodType>[] => [
  {
    id: "actions",
    header: "Akcije",
    size: 90,
    cell: ({ row }) => (
      <SeminariTableActionCell seminar={row.original} onEdit={onEdit} />
    ),
  },
  {
    header: "Naziv Seminara",
    accessorKey: "naziv",
  },
  {
    header: "Predavač",
    accessorKey: "predavac",
  },
  {
    header: "Lokacija",
    accessorKey: "lokacija",
  },
  {
    header: "Datum",
    id: "datumi",
    accessorFn: (row) =>
      (row.datumi ?? [])
        .map((date) => format(new Date(date), "yyyy-MM-dd"))
        .join(", "),
    cell: ({ row }) => {
      const datumi = row.original.datumi ?? [];

      if (datumi.length === 0) {
        return null;
      }

      return datumi.map((date) => (
        <div key={date.toString()}>{format(new Date(date), "yyyy-MM-dd")}</div>
      ));
    },
  },

  {
    header: "Broj Učesnika",
    accessorFn: (row) => row.prijave?.length || 0,
  },
];
