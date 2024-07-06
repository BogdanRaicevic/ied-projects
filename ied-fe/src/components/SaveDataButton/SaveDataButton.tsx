import Button from "@mui/material/Button";
import { exportData } from "../../api/firma.api";

type SaveButton = {
  queryParameters: any;
  fileName: string;
  exportSubject: "firma" | "zaposleni";
};

export default function SaveDataButton({ queryParameters, fileName, exportSubject }: SaveButton) {
  const handleExport = async () => {
    try {
      console.log(queryParameters, "ogdan");

      const data = await exportData(queryParameters, exportSubject);
      const blob = new Blob([data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="contained"
      sx={{ m: 1, mb: 4 }}
      size="large"
      color="info"
    >
      Export {exportSubject}
    </Button>
  );
}
