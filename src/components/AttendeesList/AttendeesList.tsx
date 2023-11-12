import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import ListItem from "@mui/material/ListItem";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import { useState } from "react";

export default function AttendeesList(props: { ucesnici: string[] }) {
  const [ucesnici, setUcesnici] = useState(props.ucesnici);

  const handleRemoveItem = (index: number) => {
    const newUcesnici = [...ucesnici];
    newUcesnici.splice(index, 1);
    setUcesnici(newUcesnici);
  };

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper", mt: 2, mb: 2 }} component="nav">
      {ucesnici.map((ucesnik, index) => {
        return (
          <ListItem key={index}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={ucesnik} />
            <Button onClick={() => handleRemoveItem(index)} sx={{ color: "darkred" }}>
              <DeleteIcon />
            </Button>
          </ListItem>
        );
      })}
    </List>
  );
}
