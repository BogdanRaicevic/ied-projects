import type { SeminarQueryParams } from "@ied-shared/types/seminar.zod";
import { Box, Tab, Tabs } from "@mui/material";
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
  const [tabIndex, setTabIndex] = useState(0);
  const handlePretraziSeminare = (values: SeminarQueryParams) => {
    setTableInputParameters(values);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <>
      <ParametriPretrageSeminar onSubmit={handlePretraziSeminare} />

      <Tabs value={tabIndex} onChange={handleChange}>
        <Tab label="Pregled po seminaru" />
        <Tab label="Pregled po firmi" />
      </Tabs>

      {tabIndex === 0 && (
        <Box mt={2}>
          <SeminariTable queryParameters={tableInputParameters} />
        </Box>
      )}

      {tabIndex === 1 && <Box mt={2}></Box>}
    </>
  );
}
