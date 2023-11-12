import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";

export default function AttendeesList(props: { ucesnici: string[] }) {
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper", mt: 2, mb: 2 }} component="nav">
      {props.ucesnici.map((ucesnik, index) => {
        return (
          <ListItemButton key={index}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={ucesnik} />
          </ListItemButton>
        );
      })}
    </List>
  );
}
