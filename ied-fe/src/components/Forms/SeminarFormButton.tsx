// SaveSeminarButton.tsx
import React from "react";
import { Button } from "@mui/material";

interface ButtonSubmit {
  onSubmit: () => void;
}

export const SaveSeminarButton: React.FC<ButtonSubmit> = ({ onSubmit }) => {
  return (
    <Button
      sx={{ m: 1 }}
      size="large"
      variant="contained"
      color="success"
      type="submit"
      onClick={onSubmit}
    >
      Sacuvaj seminar
    </Button>
  );
};

export const ArchiveSeminarButton: React.FC<ButtonSubmit> = ({ onSubmit }) => {
  return (
    <Button
      sx={{ m: 1 }}
      size="large"
      variant="contained"
      color="warning"
      type="button"
      onClick={onSubmit}
    >
      Arhiviraj Seminar
    </Button>
  );
};

export const CancelSeminarButton: React.FC<ButtonSubmit> = ({ onSubmit }) => {
  return (
    <Button
      sx={{ m: 1 }}
      size="large"
      variant="outlined"
      color="error"
      type="button"
      onClick={onSubmit}
    >
      Otkazi
    </Button>
  );
};
export const DeleteSeminarButton: React.FC<ButtonSubmit> = ({ onSubmit }) => {
  return (
    <Button
      sx={{ m: 1 }}
      size="large"
      variant="contained"
      color="error"
      type="button"
      onClick={onSubmit}
    >
      Permanento Obrisi
    </Button>
  );
};
