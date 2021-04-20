import { TemplateResult, html } from "lit-html";
import { API, GRAMMAR } from "../util/consts";
import { card, cardLinkList } from "./card";

export async function sidebar(): Promise<TemplateResult> {
  return html`<aside>${await lessonCard()}${await linksCard()}</aside>`;
}

async function lessonCard(): Promise<TemplateResult> {
  let lessonList = (
    await (
      await fetch(
        `${API}/items/lesson?fields=title,narish_title,number&sort=number`
      )
    ).json()
  ).data;
  let pad = Math.ceil(Math.log10(lessonList.length));
  return card(
    "Lessons",
    cardLinkList(
      lessonList.map((lesson) => {
        return {
          text: html`${lesson.number.toString().padStart(pad, 0)} &mdash;
          ${lesson.title} / ${lesson.narish_title}`,
          href: `/lesson/${lesson.number}`,
        };
      })
    )
  );
}

async function linksCard(): Promise<TemplateResult> {
  let pageList = (
    await (
      await fetch(
        `${API}/items/pages?filter[display_order][_neq]=null&sort=display_order&fields=title,link`
      )
    ).json()
  ).data;
  let linklist = pageList.map((page) => {
    return {
      text: page.title,
      href: page.link ? `/${page.link}` : `/`,
    };
  });
  linklist.push({
    text: "Dictionary",
    href: "/dictionary",
  });
  linklist.push({
    text: "Grammar",
    href: GRAMMAR,
    target: "_blank",
  });
  return card("Links", cardLinkList(linklist));
}
