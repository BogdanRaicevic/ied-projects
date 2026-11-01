import { red } from "@mui/material/colors";
import type { FirmaType } from "ied-shared";
import { useEffect, useState } from "react";
import { fetchFirmaPretrage } from "../../api/firma.api";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import DataTable from "../DataTable/DataTable";
import { firmaColumns } from "./firmaColumns";

export const FirmasTable = () => {
  const [data, setData] = useState<FirmaType[]>([]);
  const [documents, setDocuments] = useState(1000);

  const { pagination, setPaginationParameters, appliedParameters } =
    usePretragaStore();

  useEffect(() => {
    const loadData = async () => {
      const { pageIndex, pageSize } = pagination;
      const res = await fetchFirmaPretrage(
        pageSize,
        pageIndex,
        appliedParameters,
      );
      setData(res.firmas);
      setDocuments(res.totalDocuments);
    };
    loadData();
  }, [pagination.pageIndex, pagination.pageSize, appliedParameters]);

  return (
    <DataTable
      columns={firmaColumns}
      data={data}
      pagination={pagination}
      onPaginationChange={setPaginationParameters}
      rowCount={documents}
      pinnedLeft={["rowNumber", "naziv_firme"]}
      getRowColor={(firma) =>
        firma.prijavljeni === false ? red[100] : undefined
      }
    />
  );
};
