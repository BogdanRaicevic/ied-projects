// Every TanStack Query key lives here. Nested keys let one invalidation of
// `xKeys.all` cover everything in that domain.

export const firmaKeys = {
  all: ["firma"] as const,
  detail: (firmaId?: string) => [...firmaKeys.all, "detail", firmaId] as const,
  searches: () => [...firmaKeys.all, "search"] as const,
  search: (params: object) => [...firmaKeys.searches(), params] as const,
};

export const seminarKeys = {
  all: ["seminari"] as const,
  search: (params: object) => [...seminarKeys.all, "search", params] as const,
  firmaSeminari: (params: object) =>
    [...seminarKeys.all, "firma-seminari", params] as const,
};

export const racunKeys = {
  all: ["racuni"] as const,
  search: (params: object) => [...racunKeys.all, "search", params] as const,
};

export const pretrageKeys = {
  all: ["pretrage"] as const,
};

export const auditLogKeys = {
  all: ["audit-log"] as const,
  list: (params: object) => [...auditLogKeys.all, "list", params] as const,
  stats: (params: object) => [...auditLogKeys.all, "stats", params] as const,
};

export const mestoKeys = {
  all: ["mesta"] as const,
  names: () => [...mestoKeys.all, "names"] as const,
};

export const radnoMestoKeys = {
  all: ["radnaMesta"] as const,
  names: () => [...radnoMestoKeys.all, "names"] as const,
};

export const tipSeminaraKeys = { all: ["tipoviSeminara"] as const };
export const delatnostKeys = { all: ["delatnosti"] as const };
export const tipFirmeKeys = { all: ["tipoviFirme"] as const };
export const velicinaFirmeKeys = { all: ["velicineFirme"] as const };
export const stanjeFirmeKeys = { all: ["stanjaFirme"] as const };
export const izdavacRacunaKeys = { all: ["izdavaciRacuna"] as const };
