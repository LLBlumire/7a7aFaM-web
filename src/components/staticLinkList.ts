import { html, css, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { DB_PAGES, DB_PAGES_ORDERED } from "../common/db";
import { Page } from "../common/types";
import { onDbTable } from "../common/utils";
import { ListElement } from "./linkList";

@customElement("vli-static-link-list")
export class VliLessonList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    vli-link-list {
      margin-left: 1rem;
    }
  `;
  displayLesson(page: Page): TemplateResult {
    return html`
      <li>
        <a href="${page.link ?? "/"}">${page.title}</a>
      </li>
    `;
  }

  displayPagesList(pages: Page[]): TemplateResult {
    console.log(pages);
    return html`<vli-link-list
      .content="${pages.map((page) => {
        return {
          href: `/${page.link ?? ""}`,
          content: html`${page.title}`,
        };
      })}"
    ></vli-link-list>`;
  }

  render() {
    const customLinks: ListElement[] = [
      {
        href: "/dictionary",
        content: "Dictionary",
      },
      {
        href:
          "https://raw.githubusercontent.com/betoma/7a7aFaM/master/grammar/e7a7aFaM.pdf",
        content: "Grammar",
      },
    ];
    return html`
      ${onDbTable(DB_PAGES_ORDERED, (pages) => this.displayPagesList(pages))}
      <vli-link-list .content="${customLinks}"></vli-link-list>
    `;
  }
}
