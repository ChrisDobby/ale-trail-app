import {
    AppBar,
    Toolbar,
    Button,
    Switch,
    FormGroup,
    FormControlLabel,
    makeStyles,
    Typography,
} from "@material-ui/core";
import { ChangeEvent, useContext } from "react";
import { AppThemeContext } from "../context/appThemeContext";

const useStyles = makeStyles(() => ({
    logo: { marginRight: "0.5rem" },
    grow: {
        flexGrow: 1,
    },
}));

export function Header() {
    const classes = useStyles();
    const { darkThemeSelected, updateTheme } = useContext(AppThemeContext);

    const handleDarkModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateTheme(event.target.checked);
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
                        label="Dark mode"
                    />
                </FormGroup>
                <div className={classes.grow} />
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    );
}
