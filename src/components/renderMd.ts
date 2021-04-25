import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import marked from "marked";
import { css, html, LitElement } from "lit";

@customElement("vli-render-md")
export class VliRenderMd extends LitElement {
  static styles = css`
    * {
      margin: 0;
    }
    * + * {
      margin-top: 1em;
    }
    [data-md-directive="table-list"] + table {
      border: none;
    }
    [data-md-directive="table-list"] + table thead {
      display: none;
    }
    [data-md-directive="table-list"] + table tr td {
      width: auto !important;
      vertical-align: top;
      border: none;
    }
    [data-md-directive="table-list"] + table tr td:first-of-type {
      font-weight: bold;
    }
    [data-md-directive="table-list"] + table tr td:not(:last-of-type) {
      padding-right: 0.5em;
    }
  `;

  @property()
  content: string;

  render() {
    return html`${unsafeHTML(marked(this.content))}`;
  }
}
