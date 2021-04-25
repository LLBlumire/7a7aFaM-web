import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DB_LESSONS } from "../common/db";
import { Lesson } from "../common/types";
import { onDbTable } from "../common/utils";

@customElement("vli-lesson")
export class VliLesson extends LitElement {
  @property()
  number: number;

  displayLesson(lesson: Lesson): TemplateResult {
    return html`
      <vli-card .heading="${lesson.title} / ${lesson.narish_title}">
        <vli-render-md .content="${lesson.lesson}"></vli-render-md>
      </vli-card>
    `;
  }

  render() {
    return html`${onDbTable(DB_LESSONS, (lesson) =>
      this.displayLesson(lesson[this.number - 1])
    )}`;
  }
}
