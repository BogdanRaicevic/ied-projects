import type {
  FirmaSeminarSearchParams,
  SeminarQueryParams,
} from "@ied-shared/types/seminar.zod";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Skeleton,
  Tab,
  Tabs,
} from "@mui/material";
import { addMonths, subMonths } from "date-fns";
import { useState, useTransition } from "react";
import FirmaSeminarTable from "../components/Seminari/FirmaSeminarTable";
import ParametriPretrageFirmaSeminar from "../components/Seminari/ParametriPretrageFirmaSeminar";
import { ParametriPretrageSeminar } from "../components/Seminari/ParametriPretrageSeminar";
import SeminarForm from "../components/Seminari/SeminarForm";
import SeminariTable from "../components/Seminari/SeminariTable";

export default function Seminari() {
  const [searchSeminariParameters, setSearchSeminariParameters] =
    useState<SeminarQueryParams>({
      naziv: "",
      predavac: "",
      lokacija: "",
      datumOd: subMonths(new Date(), 3),
      datumDo: addMonths(new Date(), 3),
    });
  const [firmaSeminarParams, setFirmaSeminarParams] =
    useState<FirmaSeminarSearchParams>({
      nazivFirme: "",
      nazivSeminara: "",
      tipFirme: [],
      delatnost: [],
      radnaMesta: [],
      velicineFirme: [],
      predavac: "",
      datumOd: new Date(),
      datumDo: addMonths(new Date(), 1),
    });

  const [tabIndex, setTabIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [createSeminar, setCreateSeminar] = useState(false);

  const handlePretraziSeminare = (values: SeminarQueryParams) => {
    setSearchSeminariParameters(values);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    startTransition(() => {
      setTabIndex(newValue);
    });
  };

  const handleSearchFirmaSeminar = (values: FirmaSeminarSearchParams) => {
    setFirmaSeminarParams(values);
  };

  return (
    <>
      <Tabs value={tabIndex} onChange={handleChange}>
        <Tab label="Pregled po seminaru" />
        <Tab label="Pregled po firmi" />
      </Tabs>

      <Box mt={2}>
        {isPending ? (
          <Box>
            <Skeleton variant="rounded" height={60} animation="wave" />
            <Skeleton variant="text" height={40} animation="wave" />
            <Skeleton variant="rectangular" height={400} animation="wave" />
            <Skeleton variant="text" height={40} animation="wave" />
            <Skeleton variant="rectangular" height={400} animation="wave" />
          </Box>
        ) : (
          <>
            {tabIndex === 0 && (
              <Box>
                <ParametriPretrageSeminar onSubmit={handlePretraziSeminare} />
                <Button
                  size="large"
                  variant="contained"
                  color="secondary"
                  onClick={() => setCreateSeminar(true)}
                >
                  Kreiraj Seminar
                </Button>
                <Dialog
                  open={createSeminar}
                  onClose={() => setCreateSeminar(false)}
                  maxWidth="lg"
                >
                  <DialogContent>
                    <Box sx={{ p: 2 }}>
                      <SeminarForm
                        onSuccess={() => {
                          setCreateSeminar(false);
                        }}
                      />
                    </Box>
                  </DialogContent>
                </Dialog>

                <SeminariTable queryParameters={searchSeminariParameters} />
              </Box>
            )}
            {tabIndex === 1 && (
              <Box>
                <ParametriPretrageFirmaSeminar
                  onSubmit={handleSearchFirmaSeminar}
                />
                <FirmaSeminarTable queryParameters={firmaSeminarParams} />
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
}
