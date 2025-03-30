import { useEffect, useCallback } from "react";
import type { Racun } from "../types";

interface UseRacunCalculationsProps {
  racun: Partial<Racun>;
  onCalculationsUpdate: (calculations: Partial<Racun>) => void;
}

export const useRacunCalculations = ({
  racun,
  onCalculationsUpdate,
}: UseRacunCalculationsProps) => {
  const calculateValues = useCallback(() => {
    const onlineCena = Number(racun.onlineCena) || 0;
    const offlineCena = Number(racun.offlineCena) || 0;
    const brojUcesnikaOnline = Number(racun?.brojUcesnikaOnline) || 0;
    const brojUcesnikaOffline = Number(racun?.brojUcesnikaOffline) || 0;
    const popustOnline = Number(racun?.popustOnline) || 0;
    const popustOffline = Number(racun?.popustOffline) || 0;
    const stopaPdv = Number(racun.stopaPdv) || 0;

    const onlineUkupnaNaknada =
      onlineCena * brojUcesnikaOnline * (1 - popustOnline / 100) * (1 + stopaPdv / 100);

    const offlineUkupnaNaknada =
      offlineCena * brojUcesnikaOffline * (1 - popustOffline / 100) * (1 + stopaPdv / 100);

    const onlinePoreskaOsnovica = onlineCena * brojUcesnikaOnline * (1 - popustOnline / 100);
    const offlinePoreskaOsnovica = offlineCena * brojUcesnikaOffline * (1 - popustOffline / 100);
    const avansPdv = (Number(racun.avansBezPdv) * stopaPdv) / 100;
    const avans = Number(racun.avansBezPdv) + Number(avansPdv);

    return {
      onlineUkupnaNaknada,
      offlineUkupnaNaknada,
      pdvOffline: (offlinePoreskaOsnovica * stopaPdv) / 100,
      pdvOnline: (onlinePoreskaOsnovica * stopaPdv) / 100,
      onlinePoreskaOsnovica,
      offlinePoreskaOsnovica,
      ukupnaNaknada: onlineUkupnaNaknada + offlineUkupnaNaknada,
      ukupanPdv:
        (offlinePoreskaOsnovica * stopaPdv) / 100 + (onlinePoreskaOsnovica * stopaPdv) / 100,
      avansPdv,
      avans,
    };
  }, [
    racun.onlineCena,
    racun.offlineCena,
    racun.brojUcesnikaOnline,
    racun.brojUcesnikaOffline,
    racun.popustOnline,
    racun.popustOffline,
    racun.stopaPdv,
    racun.avansBezPdv,
  ]);

  useEffect(() => {
    const calculations = calculateValues();
    onCalculationsUpdate(calculations);
  }, [calculateValues, onCalculationsUpdate]);
};
