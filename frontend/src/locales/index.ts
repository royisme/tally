// Locales index - re-export all locale messages
import enUS from "./en-US";
import zhCN from "./zh-CN";
import zodZhCN from "zod-i18n-map/locales/zh-CN/zod.json";
import zodEn from "zod-i18n-map/locales/en/zod.json";
import type { Locale } from "@/locales/types";
import type { LocaleMessageValue, VueMessageType } from "vue-i18n";
import { allModules, collectModuleMessages } from "@/modules/registry";

// Define the message dictionary type that vue-i18n expects
type MessageDictionary = {
  [key: string]: LocaleMessageValue<VueMessageType> | MessageDictionary;
};

// Helper to convert i18next style placeholders {{param}} to vue-i18n style {param}
function convertToVueI18n<T>(messages: T): T {
  if (typeof messages === "string") {
    return messages
      .replace(/\{\{\s*-\s*([^}]+)\s*\}\}/g, "{$1}")
      .replace(/\{\{\s*([^}]+)\s*\}\}/g, "{$1}") as T;
  }
  if (messages && typeof messages === "object" && !Array.isArray(messages)) {
    const record = messages as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      out[key] = convertToVueI18n(value);
    }
    return out as T;
  }
  return messages;
}

function deepMerge(
  target: MessageDictionary,
  source: MessageDictionary
): MessageDictionary {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      target[key] = deepMerge(
        existing as MessageDictionary,
        value as MessageDictionary
      );
    } else {
      target[key] = value;
    }
  }
  return target;
}

function mergeLocaleMessages(
  base: MessageDictionary,
  extras: MessageDictionary[]
): MessageDictionary {
  const merged: MessageDictionary = { ...base };
  for (const extra of extras) {
    deepMerge(merged, extra);
  }
  return merged;
}

export const messages = {
  "en-US": mergeLocaleMessages(enUS as MessageDictionary, [
    ...collectModuleMessages(allModules).map(
      (m) => (m["en-US"] ?? {}) as MessageDictionary
    ),
    convertToVueI18n(zodEn) as MessageDictionary,
  ]),
  "zh-CN": mergeLocaleMessages(zhCN as MessageDictionary, [
    ...collectModuleMessages(allModules).map(
      (m) => (m["zh-CN"] ?? {}) as MessageDictionary
    ),
    convertToVueI18n(zodZhCN) as MessageDictionary,
  ]),
};

export { enUS, zhCN };
export type { Locale };
