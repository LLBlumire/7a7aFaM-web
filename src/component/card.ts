import { html, TemplateResult } from "lit-html";

export function card(
  title: string | TemplateResult,
  content: TemplateResult
): TemplateResult {
  return html`
    <div class="card">
      <h1 class="card__title">${title}</h1>
      <div class="card__content">${content}</div>
    </div>
  `;
}

export function cardLinkList(
  links: {
    text: string | TemplateResult;
    href: string;
    target?: string;
  }[]
): TemplateResult {
  return html`
    <ul class="card__link_list">
      ${links.map(
        (link) =>
          html`<li>
            <a href="${link.href}" target="${link.target ?? "_self"}"
              >${link.text}</a
            >
          </li>`
      )}
    </ul>
  `;
}
