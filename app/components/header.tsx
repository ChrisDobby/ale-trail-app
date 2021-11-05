import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MouseEventHandler, useState, useCallback } from "react";
import { Link } from "remix";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
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
                <Link to="/" style={{ textDecoration: "none", marginRight: "0.5rem" }}>
                    <IconButton>
                        <HomeIcon />
                    </IconButton>
                </Link>
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
