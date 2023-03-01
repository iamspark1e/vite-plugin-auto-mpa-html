import ejs from "ejs";
import type { Options as EjsOptions } from "ejs";

// TODO: support skip specific markup of ejs (use ejs both frontend render & backend injection).
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
