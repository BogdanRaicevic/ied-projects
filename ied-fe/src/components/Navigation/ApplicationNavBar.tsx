import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import { Link as RouteLink } from "react-router-dom";

export default function ApplicationNavBar() {
  const navItems = [
    { text: "Pretrage", linkPath: "/pretrage" },
    { text: "Seminari", linkPath: "/seminari" },
    { text: "Računi", linkPath: "/racuni" },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
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
          <Link component={RouteLink} to={"/prijava"} sx={{ color: "white" }}>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
