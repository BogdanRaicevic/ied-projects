import { red } from "@mui/material/colors";
import type { ZaposleniType } from "ied-shared";
import { useMemo, useState } from "react";
import DataTable from "../DataTable/DataTable";
import { getZaposleniColumns, type ZaposleniActions } from "./zaposleniColumns";

type ZaposleniTableProps = ZaposleniActions & {
  zaposleni: ZaposleniType[];
};

export const ZaposleniTable: React.FC<ZaposleniTableProps> = ({
  zaposleni,
  onEdit,
  onDelete,
  onPrijaviNaSeminar,
  isDeleting,
  deletingZaposleniId,
}) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });

  const columns = useMemo(
    () =>
      getZaposleniColumns({
        onEdit,
        onDelete,
        onPrijaviNaSeminar,
        isDeleting,
        deletingZaposleniId,
      }),
    [onEdit, onDelete, onPrijaviNaSeminar, isDeleting, deletingZaposleniId],
  );

  return (
    <DataTable
      columns={columns}
      data={zaposleni}
      pagination={pagination}
      onPaginationChange={setPagination}
      pinnedLeft={["rowNumber", "actions"]}
      getRowColor={(z) => (z.prijavljeni === false ? red[100] : undefined)}
    />
  );
};
