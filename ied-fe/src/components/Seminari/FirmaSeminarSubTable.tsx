import type { SeminarDetail } from "ied-shared";
import DataTable from "../DataTable/DataTable";
import { firmaSeminarSubColumns } from "./firmaSeminarSubColumns";

export default function FirmaSeminarSubTable({
  seminars,
}: {
  seminars: SeminarDetail[];
}) {
  return <DataTable columns={firmaSeminarSubColumns} data={seminars ?? []} />;
}
