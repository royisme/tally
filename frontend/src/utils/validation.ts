import { z } from "zod";
import { makeZodI18nMap } from "zod-i18n-map";

export function setupZodI18n(i18n: any) {
  z.setErrorMap(
    makeZodI18nMap({
      t: ((key: string, options?: any) => i18n.global.t(key, options)) as any,
      // Disable field path translation to avoid "Not found 'fieldName' key" warnings.
      // Form labels already display field names clearly, so error messages don't need them.
      handlePath: false,
    })
  );
}
