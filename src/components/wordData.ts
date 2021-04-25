import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, TemplateResult } from "lit";
import { Word, WordData } from "../common/types";
import { onDbTable } from "../common/utils";
import { WORD_DATA_ID_MAP } from "../common/db";

@customElement("vli-word-data")
export class VliWordData extends LitElement {
  static styles = css`
    .pos,
    .pattern {
      font-style: italic;
    }
    * + .wordnd,
    * + .pos,
    * + .pattern,
    * + .root {
      margin-left: 1em;
    }
    .wordnd a,
    .wordnd a:visited,
    .root a,
    .root a:visited {
      text-decoration: none;
      color: #660099;
    }
    .definition {
      margin-top: 1em;
    }
    .example {
      background-color: #ffffee;
      padding: 0.25em;
      margin: 0.25em;
      border-left: 0.5rem solid #ffeeaa;
    }
    .inline-word {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .inline-word > * {
      margin: 0;
    }
    ol.definitions {
      width: 100%;
      list-style-type: decimal;
      margin: 0;
      padding: 0;
      margin-left: 1rem;
    }
    ol.definitions .definition {
      margin: 0;
      padding-left: 0.5rem;
    }
  `;

  @property()
  word: number;

  @property()
  inline: boolean;

  displayWord(words: Map<number, WordData>): TemplateResult {
    const word = words.get(this.word);
    return html`
      <vli-card .heading="${word.word}">
        <span class="pos">${word.pos}</span>
        ${word.pattern
          ? html`<span class="pattern">${word.pattern.name}</span>`
          : html``}
        ${word.root
          ? html`
              <span class="root">
                <a href="/dictionary/root/${word.root.id}">
                  ${word.root.bone_one}&ndash;${word.root.bone_two}
                </a>
              </span>
            `
          : html``}
        ${word.definitions.map((definition) => {
          return html`
            <div class="definition">${definition.definition}</div>
            ${definition.examples.map((example) => {
              return html`
                <div class="example">
                  ${example.narish
                    ? html`<div class="narish">${example.narish}</div>`
                    : html``}
                  <div class="english">${example.english}</div>
                </div>
              `;
            })}
          `;
        })}
        <a href="/dictionary" slot="actions">Back to dictionary</a>
      </vli-card>
    `;
  }

  displayInlineWord(words: Map<number, WordData>): TemplateResult {
    let word = words.get(this.word);
    return html`
      <div class="inline-word">
        <div class="wordnd">
          <a href="/dictionary/word/${word.id}">${word.word}</a>
        </div>
        <div class="pos">${word.pos}</div>
        ${word.definitions.length > 1
          ? html`<ol class="definitions">
              ${word.definitions.map((definition) => {
                return html`<li class="definition">
                  ${definition.definition}
                </li>`;
              })}
            </ol>`
          : word.definitions.map((definition) => {
              return html`
                <div class="definition">${definition.definition}</div>
              `;
            })}
      </div>
    `;
  }

  renderCard() {
    return onDbTable(WORD_DATA_ID_MAP, (words) => this.displayWord(words));
  }
  renderInline() {
    return onDbTable(WORD_DATA_ID_MAP, (words) =>
      this.displayInlineWord(words)
    );
  }

  render() {
    if (this.inline) {
      return this.renderInline();
    } else {
      return this.renderCard();
    }
  }
}
