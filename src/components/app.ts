import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { PAGES_LINK_MAP } from "../common/db";
import { until } from "lit/directives/until.js";
import { Page } from "../common/types";
import { onDbTable } from "../common/utils";
import { dispatchRouting } from "../common/router";

@customElement("vli-app")
export class VliApp extends LitElement {
  static styles = css`
    :host {
      margin: 0 auto;
      padding: var(--card-spacing, 1rem);
      max-width: 1000px;
      display: flex;
      gap: var(--card-spacing, 1rem);
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap-reverse;
    }
    main {
      flex-basis: 0;
      flex-grow: 999;
      min-width: 40ch;
    }
    aside {
      flex-basis: 350px;
      flex-grow: 1;
      flex-direction: column;
      display: flex;
      gap: var(--card-spacing, 1rem);
    }
    aside vli-card::part(heading) {
      font-size: 1.5em;
    }
    aside > .vli_card__flag > a {
      display: block;
      margin: 0;
    }
    aside > .vli_card__flag {
      padding: 0;
    }
    aside > .vli_card__flag > a > img {
      margin: 0;
      height: auto;
      display: block;
      width: 100%;
      max-width: 100%;
    }
  `;

  render() {
    return html`
      <aside part="aside">
        <vli-card class="vli_card__flag">
          <a href="/"><img src="/nareland.png" /></a>
        </vli-card>
        <vli-card heading="Lessons">
          <vli-lesson-list></vli-lesson-list>
        </vli-card>
        <vli-card heading="Links">
          <vli-static-link-list></vli-static-link-list>
        </vli-card>
      </aside>
      <main part="main">${dispatchRouting()}</main>
    `;
  }
}
