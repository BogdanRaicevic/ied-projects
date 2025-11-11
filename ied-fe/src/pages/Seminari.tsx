import type { SeminarQueryParams } from "@ied-shared/types/seminar.zod";
import { addMonths, subMonths } from "date-fns";
import { useState } from "react";
import { ParametriPretrageSeminar } from "../components/Seminari/ParametriPretrageSeminar";
import SeminariTable from "../components/Seminari/SeminariTable";

export default function Seminari() {
  const [tableInputParameters, setTableInputParameters] =
    useState<SeminarQueryParams>({
      naziv: "",
      predavac: "",
      lokacija: "",
      datumOd: subMonths(new Date(), 3),
      datumDo: addMonths(new Date(), 3),
    });

  const handlePretraziSeminare = (values: SeminarQueryParams) => {
    setTableInputParameters(values);
  };

  const handleSeminarCreated = () => {
    setTableInputParameters({ ...tableInputParameters });
  };

  return (
    <>
      <ParametriPretrageSeminar
        onSubmit={handlePretraziSeminare}
        onSeminarCreated={handleSeminarCreated}
      />
      <SeminariTable queryParameters={tableInputParameters} />
    </>
  );
}
