import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import ListItem from "@mui/material/ListItem";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, ListItemButton } from "@mui/material";
import { useState } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Zaposleni } from "../../schemas/firmaSchemas";
import AddAttendeeDialog from "./AddAttendeeDialog";

type AttendeesListProps = {
  ucesnici: string[];
  zaposleni: Zaposleni[];
};
export default function AttendeesList({ ucesnici, zaposleni }: AttendeesListProps) {
  const [attendees, setAttendees] = useState(ucesnici);

  const handleRemoveItem = (index: number) => {
    const newUcesnici = [...attendees];
    newUcesnici.splice(index, 1);
    setAttendees(newUcesnici);
  };
  const handleAddItems = (items: string[]) => {
    setAttendees([...items]);
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChecked = (checked: string[]) => {
    const uniqueChecked = [...new Set([...attendees, ...checked])];
    handleAddItems(uniqueChecked);
  };

  return (
    <>
      <List sx={{ width: "100%", bgcolor: "background.paper", mt: 2, mb: 2 }} component="nav">
        {attendees.map((ucesnik, index) => {
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
        <ListItem key="AddAttendee" sx={{ width: "300px" }}>
          <ListItemButton
            onClick={() => {
              handleClickOpen();
            }}
            sx={{ width: "100%", color: "darkgreen" }}
          >
            <ListItemIcon>
              <PersonAddIcon sx={{ color: "darkgreen" }} />
            </ListItemIcon>
            Dodaj učesnika
          </ListItemButton>
        </ListItem>
      </List>
      <AddAttendeeDialog
        open={open}
        onClose={handleClose}
        onChecked={handleChecked}
        zaposleni={zaposleni}
      ></AddAttendeeDialog>
    </>
  );
}
