import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import marked from "marked";
import { css, html, LitElement } from "lit";
import { Page } from "../common/types";

@customElement("vli-static-page")
export class VliStaticPage extends LitElement {
  static styles = css``;

  @property()
  content: Page;

  render() {
    return html`
      <vli-card heading="${this.content.title}">
        <vli-render-md .content="${this.content.content}"></vli-render-md>
      </vli-card>
    `;
  }
}
