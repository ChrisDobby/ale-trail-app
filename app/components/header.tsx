import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem } from "@mui/material";
import { MouseEventHandler, useState, useCallback } from "react";
import { Link } from "remix";
import { useNavigate } from "react-router-dom";
import SelectTheme from "./selectTheme";

type HeaderProps = { userProfile?: { picture: string; name: string } };
export default function Header({ userProfile }: HeaderProps) {
    const isAuthenticated = Boolean(userProfile);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleMenu: MouseEventHandler<HTMLButtonElement> = useCallback(event => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLogout = useCallback(() => {
        navigate("/logout");
    }, [navigate]);

    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography sx={{ marginRight: "0.5rem" }} variant="h4">
                    🍻🚉
                </Typography>
                <SelectTheme />
                <div style={{ flexGrow: 1 }} />
                {!isAuthenticated && (
                    <Link to="/dashboard" style={{ color: "#FFF", textDecoration: "inherit" }}>
                        <Typography variant="button">LOGIN</Typography>
                    </Link>
                )}
                {isAuthenticated && (
                    <>
                        <IconButton
                            aria-label={`account of ${userProfile?.name}`}
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                        >
                            {userProfile?.picture && <Avatar src={userProfile?.picture} />}
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={open}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
