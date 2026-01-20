export const NEGACIJA = {
  radnoMesto: "negate-radno-mesto",
  delatnost: "negate-delatnost",
  tipFirme: "negate-tip-firme",
  mesto: "negate-mesto",
  velicinaFirme: "negate-velicina-firme",
  stanjeFirme: "negate-stanje-firme",
  seminar: "negate-seminar",
  tipSeminara: "negate-tip-seminara",
} as const;

export type NegacijaType = (typeof NEGACIJA)[keyof typeof NEGACIJA];

export const PRIJAVA_STATUS = {
  all: "all",
  subscribed: "subscribed",
  unsubscribed: "unsubscribed",
} as const;

export type PrijavaStatusType =
  (typeof PRIJAVA_STATUS)[keyof typeof PRIJAVA_STATUS];
