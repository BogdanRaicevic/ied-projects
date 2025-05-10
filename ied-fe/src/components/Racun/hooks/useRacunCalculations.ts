import { useEffect } from "react";
import { useRacunStore } from "../store/useRacunStore";

export const useRacunCalculations = () => {
  const {
    seminar: {
      onlineCena,
      offlineCena,
      brojUcesnikaOnline,
      brojUcesnikaOffline,
      popustOnline,
      popustOffline,
      avansBezPdv,
    },
  } = useRacunStore((state) => state.racunData);
  const updateCalculations = useRacunStore((state) => state.updateCalculations);

  useEffect(() => {
    const onlineCenaNum = Number(onlineCena) || 0;
    const offlineCenaNum = Number(offlineCena) || 0;
    const brojUcesnikaOnlineNum = Number(brojUcesnikaOnline) || 0;
    const brojUcesnikaOfflineNum = Number(brojUcesnikaOffline) || 0;
    const popustOnlineNum = Number(popustOnline) || 0;
    const popustOfflineNum = Number(popustOffline) || 0;
    const stopaPdvNum = 20;
    const avansBezPdvNum = Number(avansBezPdv) || 0;

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
      pdvOnline: roundToTwoDecimals((onlinePoreskaOsnovica * stopaPdvNum) / 100),
      pdvOffline: roundToTwoDecimals((offlinePoreskaOsnovica * stopaPdvNum) / 100),
      ukupnaNaknada: roundToTwoDecimals(onlineUkupnaNaknada + offlineUkupnaNaknada - avans),
      ukupanPdv: roundToTwoDecimals(
        (offlinePoreskaOsnovica * stopaPdvNum) / 100 +
          (onlinePoreskaOsnovica * stopaPdvNum) / 100 -
          avansPdv
      ),
      avansPdv: roundToTwoDecimals(avansPdv),
      avans: roundToTwoDecimals(avans),
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
    avansBezPdv,
  ]);
};

const roundToTwoDecimals = (num: number): number => {
  // Multiply by 100, round to the nearest integer, then divide by 100
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
