import { html, css, LitElement, TemplateResult } from "lit";
import { until } from "lit-html/directives/until.js";
import { customElement, property } from "lit/decorators.js";
import { SORTED_WORDS } from "../common/db";
import { WordData } from "../common/types";
import { narishAlphaStrConvert, onDbTable } from "../common/utils";
import { ref, createRef } from "lit/directives/ref.js";

const PAGE_LIMIT = 25;

@customElement("vli-dictionary")
export class VliDictionary extends LitElement {
  static styles = css`
    vli-word-data + vli-word-data {
      display: block;
      margin-top: 1rem;
    }
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    vli-card[heading="Search"] form {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 0.5rem;
    }
    vli-card[heading="Search"] label {
      font-size: 0.75rem;
    }
    vli-card[heading="Search"] select,
    vli-card[heading="Search"] input {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      height: 2rem;
      box-sizing: border-box;
    }
    vli-card[heading="Search"] input[type="submit"],
    vli-card[heading="Search"] input[type="button"] {
      margin-top: 0.5rem;
      border: none;
      cursor: pointer;
    }
    vli-card[heading="Search"] input[type="submit"] {
      background-color: #660099;
      color: white;
      font-weight: bold;
    }
  `;
  search: DictionarySearch = new DictionarySearch();
  searchMode = createRef<HTMLSelectElement>();
  searchText = createRef<HTMLInputElement>();
  pageSelector = createRef<HTMLSelectElement>();

  clearSearch() {
    this.search.params = {};
  }
  doSearch() {
    this.search.params = {
      mode: this.searchMode.value.value == "en" ? "en" : "nd",
      search: this.searchText.value.value,
    };
  }

  setPage() {
    this.gotoPage(parseInt(this.pageSelector.value.value));
  }

  gotoPage(page: number) {
    if (page != this.search.page) {
      this.search.params = {
        mode: this.searchMode.value.value == "en" ? "en" : "nd",
        search: this.searchText.value.value,
        page: page,
      };
    }
  }

  displayDictionary(words: WordData[]): TemplateResult {
    const wordsFrom = (this.search.page - 1) * PAGE_LIMIT;
    const wordsTo = wordsFrom + PAGE_LIMIT;
    const filteredWords = words.filter((word) => this.search.test(word));
    const wordsOnPage = filteredWords.slice(wordsFrom, wordsTo);
    const pageCount = Math.ceil(filteredWords.length / PAGE_LIMIT);
    const pages = Array.from(Array(pageCount).keys()).map((n) => n + 1);
    const hasPreviousPage = pages.includes(this.search.page - 1);
    const hasNextPage = pages.includes(this.search.page + 1);
    return html`
      <vli-card heading="Search">
        <form action="javascript:void(0);">
          <label for="mode">Mode</label>
          <label for="search">Search</label>
          <select name="mode" ${ref(this.searchMode)}>
            <option
              value="en"
              ?selected=${this.search.mode == "en" ? "selected" : ""}
            >
              English
            </option>
            <option
              value="nd"
              ?selected=${this.search.mode == "nd" ? "selected" : ""}
            >
              Narish
            </option>
          </select>
          <input
            type="text"
            name="search"
            value="${this.search.search}"
            ${ref(this.searchText)}
          />
          <input
            type="button"
            value="Clear"
            @click=${() => this.clearSearch()}
          />
          <input type="submit" value="Search" @click=${() => this.doSearch()} />
        </form>
      </vli-card>
      <vli-card heading="Dictionary">
        ${wordsOnPage.map(
          (word) =>
            html` <vli-word-data
              .word="${word.id}"
              inline="true"
            ></vli-word-data>`
        )}
        ${hasPreviousPage
          ? html`
              <a
                href="javascript:void(0);"
                slot="actions"
                @click="${() => this.gotoPage(this.search.page - 1)}"
              >
                &LeftArrow;
              </a>
            `
          : html`<span slot="actions">&LeftArrow;</span>`}
        <span slot="actions">
          <select
            name="page"
            @change="${() => this.setPage()}"
            ${ref(this.pageSelector)}
          >
            ${pages.map(
              (page) =>
                html`
                  <option
                    value="${page}"
                    ?selected="${page == this.search.page ? "selected" : ""}"
                  >
                    ${page}
                  </option>
                `
            )}
          </select>
          of ${pageCount}
        </span>
        ${hasNextPage
          ? html`
              <a
                href="javascript:void(0);"
                slot="actions"
                @click="${() => this.gotoPage(this.search.page + 1)}"
              >
                &RightArrow;
              </a>
            `
          : html`<span slot="actions">&RightArrow;</span>`}
      </vli-card>
    `;
  }
  render() {
    return onDbTable(SORTED_WORDS, (wordData) =>
      this.displayDictionary(wordData)
    );
  }
}

interface DictionarySearchParams {
  mode: "en" | "nd";
  search: string;
  page: number;
}
class DictionarySearch {
  #params: DictionarySearchParams;
  get page(): number {
    return this.#params.page ?? 1;
  }
  get search(): string {
    return this.#params.search;
  }
  get mode(): "en" | "nd" {
    return this.#params.mode;
  }
  set params(newParams: Partial<DictionarySearchParams>) {
    const newUrlSearch = new URLSearchParams();
    if (newParams.mode) {
      newUrlSearch.set("mode", newParams.mode);
    }
    if (newParams.search) {
      newUrlSearch.set("search", newParams.search);
    }
    if (newParams.page) {
      newUrlSearch.set("page", newParams.page.toString());
    }
    window.location.search = newUrlSearch.toString();
  }
  test(word: WordData): boolean {
    if (this.search) {
      if (this.mode == "en") {
        return this.testEnglish(word);
      } else {
        return this.testNarish(word);
      }
    } else {
      return true;
    }
  }
  testEnglish(word: WordData): boolean {
    return word.definitions.some((definition) =>
      definition.definition.toLowerCase().includes(this.search.toLowerCase())
    );
  }
  testNarish(word: WordData): boolean {
    return narishAlphaStrConvert(word.word.toLowerCase()).includes(
      narishAlphaStrConvert(this.search.toLowerCase().replace(/7/g, "ɂ"))
    );
  }
  constructor() {
    const urlSearch = new URLSearchParams(window.location.search);
    const page = parseInt(urlSearch.get("page"));
    this.#params = {
      mode: urlSearch.get("mode") == "nd" ? "nd" : "en",
      search: urlSearch.get("search"),
      page: page ? page : 1,
    };
  }
}
