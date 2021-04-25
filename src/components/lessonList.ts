import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DB_LESSONS } from "../common/db";
import { Lesson } from "../common/types";
import { onDbTable } from "../common/utils";

@customElement("vli-lesson-list")
export class VliLessonList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    vli-link-list {
      margin-left: 1rem;
    }
  `;
  displayLesson(lesson: Lesson): TemplateResult {
    return html`
      <li>
        <a href="/lesson/${lesson.number}">
          ${lesson.number} &mdash; ${lesson.title} / ${lesson.narish_title}
        </a>
      </li>
    `;
  }

  displayLessonList(lessons: Lesson[]): TemplateResult {
    return html`<vli-link-list
      .content="${lessons.map((lesson) => {
        return {
          href: `/lesson/${lesson.number}`,
          content: html`${lesson.number} &mdash; ${lesson.title} /
          ${lesson.narish_title}`,
        };
      })}"
    ></vli-link-list>`;
  }

  render() {
    return html`
      ${onDbTable(DB_LESSONS, (lessons) => this.displayLessonList(lessons))}
    `;
  }
}
