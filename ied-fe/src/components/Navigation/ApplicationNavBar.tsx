import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link as RouteLink } from "react-router-dom";
import Link from "@mui/material/Link";
import { SignedOut, SignInButton, SignedIn, UserButton, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useAuthStore } from "../../store/auth.store";

export default function ApplicationNavBar() {
  const navItems = [
    // { text: "Evidencija", linkPath: "/evidencija" },
    { text: "Pretrage", linkPath: "/pretrage" },
    // { text: "Računi", linkPath: "/racuni" },
    // { text: "Zaposleni", linkPath: "/zaposleni" },
    { text: "Seminari", linkPath: "/seminari" },
  ];

  const { setToken, clearToken } = useAuthStore();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          setToken(token);
        } else {
          clearToken();
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        clearToken();
      }
    };

    fetchToken();
  }, [getToken, setToken, clearToken]);

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
