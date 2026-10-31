import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ButtonBase, Tooltip } from "@mui/material";
import { type ReactNode, useState } from "react";

export default function CopyOnClick({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const [title, setTitle] = useState("Kopiraj");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setTitle("Kopirano");
    } catch {
      setTitle("Kopiranje nije uspelo");
    }
  };

  return (
    <Tooltip title={title} onClose={() => setTitle("Kopiraj")}>
      <ButtonBase onClick={copy} sx={{ font: "inherit", textAlign: "left" }}>
        {children}
        <ContentCopyIcon sx={{ fontSize: 14, ml: 0.5, opacity: 0.5 }} />
      </ButtonBase>
    </Tooltip>
  );
}
