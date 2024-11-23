import Button from "@mui/material/Button";
import { exportData } from "../../api/firma.api";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuth } from "@clerk/clerk-react";

type SaveButton = {
  queryParameters: any;
  fileName: string;
  exportSubject: "firma" | "zaposleni";
};

export default function ExportDataButton({ queryParameters, fileName, exportSubject }: SaveButton) {
  const { getToken } = useAuth();

  const handleExport = async () => {
    try {
      console.log(queryParameters, "ogdan");

      const token = await getToken();
      const data = await exportData(queryParameters, exportSubject, token);
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
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      variant="contained"
      sx={{ m: 1 }}
      size="large"
      color="info"
    >
      Export {exportSubject}
    </Button>
  );
}
