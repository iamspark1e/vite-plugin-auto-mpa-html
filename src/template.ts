import ejs from "ejs";
import type { Options as EjsOptions } from "ejs";

// Directly called `ejs.render`, so unit test is skipped.
export default function renderEjs(
  templateStr: string,
  data?: object,
  ejsOption?: EjsOptions
): string {
  if (data)
    return ejs.render(templateStr, data, {
      ...ejsOption,
      async: false,
    });
  return templateStr;
}
