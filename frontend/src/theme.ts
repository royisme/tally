import type { GlobalThemeOverrides } from "naive-ui";

/**
 * FreelanceFlow "Sand & Stone" Theme
 *
 * Architecture:
 * - Shared Geometry/Typography: Defined in common config.
 * - Palette: Strict Light/Dark tone mapping.
 */

// 1. Shared Configuration (Geometry, Typography) - "The Skeleton"
const sharedConfig = {
  fontFamily: '"Inter", "Varela Round", sans-serif',
  borderRadius: {
    base: "12px",
    card: "16px",
    button: "8px",
  },
  typography: {
    cardTitleWeight: "700",
    cardTitleSize: "18px",
  },
};

// 2. Palette Definitions - "The Skin"
const palletes = {
  light: {
    primary: "#8D7B68", // Mocha
    primaryHover: "#A4907C",
    primaryPressed: "#5D5145",
    background: "#F8F7F4", // Sand
    card: "#FFFFFF",
    text: {
      main: "#2C2B29",
      secondary: "#5F5C56",
      tertiary: "#9CA3AF",
    },
    border: "#EBE9E4",
    action: "#F3F2EE", // Secondary bg
    shadow:
      "0 2px 8px -2px rgba(44, 43, 41, 0.04), 0 1px 4px -1px rgba(44, 43, 41, 0.02)",
  },
  dark: {
    primary: "#C8B6A6", // Milky Coffee
    primaryHover: "#D9C8B8",
    primaryPressed: "#E7E5E4",
    background: "#1C1917", // Espresso
    card: "#292524", // Dark Roast
    text: {
      main: "#E7E5E4",
      secondary: "#A8A29E",
      tertiary: "#57534E",
    },
    border: "#44403C",
    action: "#2A2725",
    shadow: "0 4px 12px -2px rgba(0, 0, 0, 0.3)",
  },
};

// 3. Theme Factory
function createTheme(mode: "light" | "dark"): GlobalThemeOverrides {
  const p = palletes[mode];

  return {
    common: {
      // Colors
      primaryColor: p.primary,
      primaryColorHover: p.primaryHover,
      primaryColorPressed: p.primaryPressed,
      primaryColorSuppl: p.primary,

      bodyColor: p.background,
      cardColor: p.card,
      modalColor: p.card,

      textColor1: p.text.main,
      textColor2: p.text.secondary,
      textColor3: p.text.tertiary,

      borderColor: p.border,
      dividerColor: p.border,

      // Geometry (Shared)
      fontFamily: sharedConfig.fontFamily,
      borderRadius: sharedConfig.borderRadius.base,
    },
    Card: {
      borderRadius: sharedConfig.borderRadius.card,
      borderColor: p.border,
      boxShadow: p.shadow,
      titleTextColor: p.text.main,
      titleFontWeight: sharedConfig.typography.cardTitleWeight,
    },
    Button: {
      borderRadius: sharedConfig.borderRadius.button,
      fontWeight: "600",
      textColorQuaternary: p.text.secondary,
      textColorHoverQuaternary: p.primary,
    },
    Menu: {
      itemBorderRadius: "8px",
      fontSize: "14px",
      itemHeight: "40px",

      // States
      itemColorHover: p.action,
      itemTextColorHover: p.primary,
      itemColorActive: mode === "light" ? "#F0EBE5" : "#44403C",
      itemTextColorActive: mode === "light" ? "#5D5145" : p.primary,
      itemIconColorActive: mode === "light" ? "#5D5145" : p.primary,
    },
    Statistic: {
      labelTextColor: p.text.secondary,
      labelFontWeight: "500",
      valueTextColor: p.text.main,
      valueFontWeight: "700",
    },
    Layout: {
      siderColor: p.card, // Sider always matches Card/Modal surface
      headerColor: p.card,
      siderBorderColor: p.border,
      headerBorderColor: p.border,
    },
  };
}

// 4. Exports
export const lightThemeOverrides = createTheme("light");
export const darkThemeOverrides = createTheme("dark");
