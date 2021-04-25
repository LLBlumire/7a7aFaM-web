import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("vli-card")
export class VliCard extends LitElement {
  static styles = css`
    :host {
      background-color: white;
      padding: 1.5rem;
      display: block;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    h1 {
      margin: 0;
      margin-bottom: 1rem;
      padding: 0;
      color: #660099;
      font-size: 2em;
    }
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    slot[name="actions"]::slotted(*) {
      margin-top: 1rem;
    }
    slot[name="actions"]::slotted(a),
    slot[name="actions"]::slotted(a:visited) {
      color: #660099;
      text-decoration: none;
    }
  `;

  @property()
  heading: string | null = null;

  render() {
    return html`
      ${this.heading ? html`<h1 part="heading">${this.heading}</h1>` : html``}
      <slot></slot>
      <div class="actions">
        <slot name="actions"></slot>
      </div>
    `;
  }
}
