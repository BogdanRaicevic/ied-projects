export const formatToRSDNumber = (value: number | string) => {
  if (!value) return "";
  return Number(value).toLocaleString("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 2,
  });
};
