import { TemplateResult, html } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { API } from "../../util/consts";
import { card } from "../card";
import marked from "marked";

export async function lesson(number: number): Promise<TemplateResult> {
  let lesson = (
    await (
      await fetch(
        `${API}/items/lesson?filter[number][_eq]=${number}&fields=title,narish_title,lesson`
      )
    ).json()
  ).data[0];
  let existingLessons = (
    await (await fetch(`${API}/items/lesson?fields=number`)).json()
  ).data.map((lesson) => lesson.number);

  if (!lesson || !lesson.lesson) {
    window.location.replace(`${window.location.origin}/404`);
  }

  return card(
    html`Lesson ${number} &mdash; ${lesson.title} / ${lesson.narish_title}`,
    html`
      ${unsafeHTML(marked(lesson.lesson))}
      <div class="card__actions">
        ${existingLessons.includes(number - 1)
          ? html`<a href="/lesson/${number - 1}">&LeftArrow;Previous</a>`
          : html``}
        ${existingLessons.includes(number + 1)
          ? html`<a href="/lesson/${number + 1}">Next&RightArrow;</a>`
          : html``}
      </div>
    `
  );
}
