import { Show, SignInButton, UserButton } from "@clerk/react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import { Link as RouteLink } from "react-router-dom";
import { env } from "../../utils/envVariables";

export default function ApplicationNavBar() {
  const navItems = [
    { text: "Pretrage", linkPath: "/pretrage", condition: true },
    { text: "Seminari", linkPath: "/seminari", condition: true },
    { text: "Računi", linkPath: "/racuni", condition: true },
    {
      text: "Računi V2",
      linkPath: "/racuni-v2",
      condition: env.ffRacuniV2,
    },
    { text: "Evidencija Promena", linkPath: "/audit-log", condition: true },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
            {navItems
              .filter((item) => item.condition)
              .map((item) => (
                <Link
                  key={item.text}
                  component={RouteLink}
                  to={item.linkPath}
                  sx={{ color: "white" }}
                >
                  <Button sx={{ color: "#fff" }}>{item.text}</Button>
                </Link>
              ))}
          </Box>
          <Link component={RouteLink} to={"/pretrage"} sx={{ color: "white" }}>
            <Show when="signed-out">
              <SignInButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
