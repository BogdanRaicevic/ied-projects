import type { SeminarQueryParams } from "@ied-shared/types/seminar.zod";
import { Box, Skeleton, Tab, Tabs } from "@mui/material";
import { addMonths, subMonths } from "date-fns";
import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  const handlePretraziSeminare = (values: SeminarQueryParams) => {
    setTableInputParameters(values);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    startTransition(() => {
      setTabIndex(newValue);
    });
  };

  return (
    <>
      <ParametriPretrageSeminar onSubmit={handlePretraziSeminare} />
      <Tabs value={tabIndex} onChange={handleChange}>
        <Tab label="Pregled po seminaru" />
        <Tab label="Pregled po firmi" />
      </Tabs>

      <Box mt={2}>
        {isPending ? (
          <Box>
            <Skeleton variant="rounded" animation="wave" />
            <Skeleton variant="text" animation="wave" />
            <Skeleton variant="rectangular" animation="wave" />
            <Skeleton variant="text" animation="wave" />
            <Skeleton variant="rectangular" animation="wave" />
          </Box>
        ) : (
          <>
            {tabIndex === 0 && (
              <SeminariTable queryParameters={tableInputParameters} />
            )}
            {tabIndex === 1 && <Box>{/* Content for second tab */}</Box>}
          </>
        )}
      </Box>
    </>
  );
}
