import { createTheme, useMediaQuery, ThemeProvider, CssBaseline, PaletteMode } from "@mui/material";
import { createContext, ReactNode, ReactNodeArray, useEffect, useMemo, useState } from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const THEME_KEY = "ale-trail-app-theme";

function storeSelectedTheme(dark: boolean) {
    if (typeof window !== "undefined" && localStorage) {
        localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    }
}

function getStoredTheme(): PaletteMode | null {
    if (typeof window !== "undefined" && localStorage) {
        return localStorage.getItem(THEME_KEY) as PaletteMode;
    }

    return null;
}

type AppThemeContextValue = {
    darkThemeSelected: boolean;
    updateTheme: (dark: boolean) => void;
};

export const AppThemeContext = createContext<AppThemeContextValue>({
    darkThemeSelected: false,
    updateTheme: () => ({}),
});

type Props = { children: ReactNode | ReactNodeArray };
export function AppThemeProvider({ children }: Props) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? "dark" : "light");
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );

    useEffect(() => {
        const storedTheme = getStoredTheme();
        if (storedTheme && storedTheme !== mode) {
            setMode(storedTheme);
        }
    }, []);

    const updateTheme = (dark: boolean) => {
        storeSelectedTheme(dark);
        setMode(dark ? "dark" : "light");
    };

    const cache = createCache({ key: "css" });

    return (
        <AppThemeContext.Provider value={{ darkThemeSelected: theme.palette.mode === "dark", updateTheme }}>
            <CacheProvider value={cache}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </ThemeProvider>
            </CacheProvider>
        </AppThemeContext.Provider>
    );
}
