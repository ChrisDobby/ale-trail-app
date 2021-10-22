import { createTheme, useMediaQuery, ThemeProvider, CssBaseline, PaletteType } from "@material-ui/core";
import { createContext, ReactNode, ReactNodeArray, useEffect, useMemo, useState } from "react";

const THEME_KEY = "ale-trail-app-theme";

function storeSelectedTheme(dark: boolean) {
    if (typeof window !== "undefined" && localStorage) {
        localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    }
}

function getStoredTheme(): PaletteType | null {
    if (typeof window !== "undefined" && localStorage) {
        return localStorage.getItem(THEME_KEY) as PaletteType;
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
    const [paletteType, setPaletteType] = useState<PaletteType | null>(null);
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    type: paletteType || (prefersDarkMode ? "dark" : "light"),
                },
            }),
        [paletteType, prefersDarkMode],
    );

    useEffect(() => {
        const storedTheme = getStoredTheme();
        if (storedTheme && storedTheme !== paletteType) {
            setPaletteType(storedTheme);
        }
    }, []);

    const updateTheme = (dark: boolean) => {
        storeSelectedTheme(dark);
        setPaletteType(dark ? "dark" : "light");
    };

    return (
        <AppThemeContext.Provider value={{ darkThemeSelected: theme.palette.type === "dark", updateTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppThemeContext.Provider>
    );
}
