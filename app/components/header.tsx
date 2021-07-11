import {
    AppBar,
    Toolbar,
    Switch,
    FormGroup,
    FormControlLabel,
    makeStyles,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
} from "@material-ui/core";
import { ChangeEvent, MouseEventHandler, useContext, useState } from "react";
import { Link } from "remix";
import { useNavigate } from "react-router-dom";
import { AppThemeContext } from "../context/appThemeContext";

const useStyles = makeStyles(() => ({
    logo: { marginRight: "0.5rem" },
    grow: {
        flexGrow: 1,
    },
    login: { color: "#FFF", textDecoration: "inherit" },
}));

type HeaderProps = { userProfile?: { picture: string; name: string } };
export function Header({ userProfile }: HeaderProps) {
    const isAuthenticated = Boolean(userProfile);
    const classes = useStyles();
    const { darkThemeSelected, updateTheme } = useContext(AppThemeContext);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleDarkModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateTheme(event.target.checked);
    };

    const handleMenu: MouseEventHandler<HTMLButtonElement> = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        navigate("/logout");
    };

    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography className={classes.logo} variant="h4">
                    🍻🚉
                </Typography>
                <FormGroup row>
                    <FormControlLabel
                        control={<Switch checked={darkThemeSelected} onChange={handleDarkModeChange} />}
                        label="Dark theme"
                    />
                </FormGroup>
                <div className={classes.grow} />
                {!isAuthenticated && (
                    <Link to="/dashboard" className={classes.login}>
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
