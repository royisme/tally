import { vi } from "vitest";
import { applyThemeToRoot } from "@/theme/tokens";

applyThemeToRoot("light");

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: "en-US" },
  }),
}));
