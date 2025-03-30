export const RacunTypes = {
  PREDRACUN: "predracun",
  AVANSNI_RACUN: "avansni_racun",
  KONACNI_RACUN: "konacni_racun",
  RACUN: "racun",
} as const;

export type RacunTypes = (typeof RacunTypes)[keyof typeof RacunTypes];
