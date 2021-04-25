import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface ListElement {
  href: string;
  content: string | TemplateResult;
}

@customElement("vli-link-list")
export class VliLinkList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    ul {
      margin: 0;
      padding: 0;
    }
    li {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a {
      color: #660099;
      text-decoration: none;
    }
    a.active {
      color: #000000;
    }
  `;

  @property()
  content: ListElement[];

  displayListElement(element: ListElement): TemplateResult {
    if (element.href == window.location.pathname) {
      return html`<li><a class="active">${element.content}</a></li>`;
    } else {
      return html`<li><a href="${element.href}">${element.content}</a></li>`;
    }
  }

  displayLessonElementList(elements: ListElement[]): TemplateResult {
    return html`
      <ul>
        ${elements.map((element) => this.displayListElement(element))}
      </ul>
    `;
  }

  render() {
    return html` ${this.displayLessonElementList(this.content)} `;
  }
}
