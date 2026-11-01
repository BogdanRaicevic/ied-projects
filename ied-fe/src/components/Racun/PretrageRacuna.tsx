import type { PaginationState } from "@tanstack/react-table";
import type { PretrageRacunaType, RacunType } from "ied-shared";
import { useEffect, useState } from "react";
import { searchRacuni } from "../../api/racuni.api";
import DataTable from "../DataTable/DataTable";
import { ParametriPretrageRacuna } from "./ParametriPretrageRacuna";
import { racuniColumns } from "./racuniColumns";

// Stable reference: a new [] each render makes TanStack Table rebuild rows and reset expanded state.
const noRacuni: RacunType[] = [];

type SearchState = {
  filterValues: PretrageRacunaType;
  pagination: PaginationState;
};

export const PretrageRacuna = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [racuniData, setRacuniData] = useState<{
    totalDocuments: number;
    totalPages: number;
    racuni: RacunType[];
  }>();

  const [searchState, setSearchState] = useState<SearchState>({
    filterValues: {},
    pagination: {
      pageIndex: 0,
      pageSize: 20,
    },
  });

  const handleSearch = (newFilters: PretrageRacunaType) => {
    setSearchState((prev) => ({
      filterValues: newFilters,
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
  };

  useEffect(() => {
    const fetchRacuni = async () => {
      try {
        setLoading(true);
        const data = await searchRacuni(
          searchState.pagination.pageIndex,
          searchState.pagination.pageSize,
          searchState.filterValues,
        );
        setRacuniData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRacuni();
  }, [searchState]);

  return (
    <div>
      <h1>Pretrage Racuna</h1>
      <ParametriPretrageRacuna onSearch={handleSearch} />
      <DataTable
        columns={racuniColumns}
        data={racuniData?.racuni ?? noRacuni}
        isLoading={loading}
        pagination={searchState.pagination}
        onPaginationChange={(pagination) =>
          setSearchState((prev) => ({ ...prev, pagination }))
        }
        rowCount={racuniData?.totalDocuments || 0}
      />
    </div>
  );
};
