import { useEffect } from "react";
import { useRacunStore } from "../store/useRacunStore";
import { TipRacuna } from "@ied-shared/index";

// TODO: move billing calculations to the backend
export const useRacunCalculations = () => {
  const {
    seminar: { onlineCena, offlineCena, brojUcesnikaOnline, brojUcesnikaOffline },
    calculations: { avansBezPdv, popustOnline, popustOffline },
    tipRacuna,
    stopaPdv,
  } = useRacunStore((state) => state.racunData);
  const updateCalculations = useRacunStore((state) => state.updateCalculations);

  useEffect(() => {
    const onlineCenaNum = onlineCena || 0;
    const offlineCenaNum = offlineCena || 0;
    const brojUcesnikaOnlineNum = brojUcesnikaOnline || 0;
    const brojUcesnikaOfflineNum = brojUcesnikaOffline || 0;
    const popustOnlineNum = popustOnline || 0;
    const popustOfflineNum = popustOffline || 0;
    const stopaPdvNum = stopaPdv || 0;
    const avansBezPdvNum = avansBezPdv || 0;

    const onlineUkupnaNaknada =
      onlineCenaNum * brojUcesnikaOnlineNum * (1 - popustOnlineNum / 100) * (1 + stopaPdvNum / 100);

    const offlineUkupnaNaknada =
      offlineCenaNum *
      brojUcesnikaOfflineNum *
      (1 - popustOfflineNum / 100) *
      (1 + stopaPdvNum / 100);

    const onlinePoreskaOsnovica =
      onlineCenaNum * brojUcesnikaOnlineNum * (1 - popustOnlineNum / 100);
    const offlinePoreskaOsnovica =
      offlineCenaNum * brojUcesnikaOfflineNum * (1 - popustOfflineNum / 100);
    const avansPdv = (avansBezPdvNum * stopaPdvNum) / 100;
    const avans = avansBezPdvNum + avansPdv;

    const calculations = {
      onlineUkupnaNaknada: roundToTwoDecimals(onlineUkupnaNaknada),
      offlineUkupnaNaknada: roundToTwoDecimals(offlineUkupnaNaknada),
      onlinePoreskaOsnovica: roundToTwoDecimals(onlinePoreskaOsnovica),
      offlinePoreskaOsnovica: roundToTwoDecimals(offlinePoreskaOsnovica),
      popustOnline: popustOnlineNum,
      popustOffline: popustOfflineNum,
      pdvOnline: roundToTwoDecimals((onlinePoreskaOsnovica * stopaPdvNum) / 100),
      pdvOffline: roundToTwoDecimals((offlinePoreskaOsnovica * stopaPdvNum) / 100),
      ukupnaNaknada:
        tipRacuna === TipRacuna.KONACNI_RACUN
          ? roundToTwoDecimals(onlineUkupnaNaknada + offlineUkupnaNaknada - avans)
          : roundToTwoDecimals(onlineUkupnaNaknada + offlineUkupnaNaknada),
      ukupanPdv: roundToTwoDecimals(
        (offlinePoreskaOsnovica * stopaPdvNum) / 100 +
          (onlinePoreskaOsnovica * stopaPdvNum) / 100 -
          avansPdv
      ),
      avansPdv: roundToTwoDecimals(avansPdv),
      avans: roundToTwoDecimals(avans),
      avansBezPdv: avansBezPdvNum,
    };

    updateCalculations(calculations);
  }, [
    onlineCena,
    offlineCena,
    brojUcesnikaOnline,
    brojUcesnikaOffline,
    popustOnline,
    popustOffline,
    avansBezPdv,
    stopaPdv,
  ]);
};

const roundToTwoDecimals = (num: number): number => {
  // Multiply by 100, round to the nearest integer, then divide by 100
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
