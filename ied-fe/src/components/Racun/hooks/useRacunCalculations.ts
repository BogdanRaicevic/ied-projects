import { useEffect } from "react";
import { useRacunStore } from "../store/useRacunStore";

export const useRacunCalculations = () => {
  const { seminar, stopaPdv, avansBezPdv } = useRacunStore((state) => state.racunData);
  const updateCalculations = useRacunStore((state) => state.updateCalculations);

  useEffect(() => {
    const onlineCenaNum = Number(seminar.onlineCena) || 0;
    const offlineCenaNum = Number(seminar.offlineCena) || 0;
    const brojUcesnikaOnlineNum = Number(seminar.brojUcesnikaOnline) || 0;
    const brojUcesnikaOfflineNum = Number(seminar.brojUcesnikaOffline) || 0;
    const popustOnlineNum = Number(seminar.popustOnline) || 0;
    const popustOfflineNum = Number(seminar.popustOffline) || 0;
    const stopaPdvNum = Number(stopaPdv) || 0;
    const avansBezPdvNum = Number(seminar.avansBezPdv) || 0;

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
      onlineUkupnaNaknada,
      offlineUkupnaNaknada,
      onlinePoreskaOsnovica,
      offlinePoreskaOsnovica,
      pdvOnline: (onlinePoreskaOsnovica * stopaPdvNum) / 100,
      pdvOffline: (offlinePoreskaOsnovica * stopaPdvNum) / 100,
      ukupnaNaknada: onlineUkupnaNaknada + offlineUkupnaNaknada - avans,
      ukupanPdv:
        (offlinePoreskaOsnovica * stopaPdvNum) / 100 +
        (onlinePoreskaOsnovica * stopaPdvNum) / 100 -
        avansPdv,
      avansPdv,
      avans,
    };

    updateCalculations(calculations);
  }, [seminar, stopaPdv, avansBezPdv, updateCalculations]);
};
