import { html, TemplateResult } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import marked from "marked";
import { API } from "../util/consts";
import { card } from "./card";
import { lesson } from "./page/lesson";

export async function main(): Promise<TemplateResult> {
  const path = getPath();
  return html`<main>${await mainContent(path)}</main>`;
}
async function mainContent(path: string[]): Promise<TemplateResult> {
  switch (path[0]) {
    case "":
      return await loadPage(null);
    case "lesson":
      return await lesson(parseInt(path[1]));
    default:
      return await loadPage(path[0]);
  }
}

async function loadPage(page: string | null): Promise<TemplateResult> {
  let pageContent = (
    await (
      await fetch(
        `${API}/items/pages?filter[link][_eq]=${
          page ?? "null"
        }&fields=title,content`
      )
    ).json()
  ).data[0];
  if (!pageContent) {
    return card(
      html`Error 404 &mdash; Page Not Found`,
      html`Maybe try going <a href="/">home</a>?`
    );
  }
  return card(
    pageContent.title,
    html`${unsafeHTML(marked(pageContent.content))}`
  );
}

function getPath(): string[] {
  return window.location.pathname.split("/").slice(1);
}
