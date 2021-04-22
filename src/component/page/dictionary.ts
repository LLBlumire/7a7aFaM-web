import { TemplateResult, html } from "lit-html";
import { API } from "../../util/consts";
import { card } from "../card";
import { openDB } from "idb";

type Example = {
  english: string;
  narish?: string;
};
type Definition = {
  definition: string;
  examples?: Example[];
};
type Word = {
  id: number;
  word: string;
  pos: string;
  definitions: Definition[];
};

const LEFT_RIGHT = -1;
const RIGHT_LEFT = 1;

function alphaStrConvert(input: string): string {
  return input
    .replace("Ɂ", "@")
    .replace("ɂ", "`")
    .replace("Y", "J")
    .replace("y", "j");
}

async function getDictionaryData(bypassCache = false): Promise<Word[]> {
  let data: Word[] = JSON.parse(window.localStorage.getItem("dictionaryData"));
  let timeout = parseInt(window.localStorage.getItem("dictionaryTimeout"));
  let time = new Date().getTime();

  let dictdata;
  if (bypassCache || !data || (data && timeout < time)) {
    let requestPage = (page) =>
      `${API}/items/words?fields=word,pattern.number,pos,definitions.definition,root.bone_one,root.bone_two,id&meta=total_count&page=${page}`;
    let { data: dictionary, meta } = await (await fetch(requestPage(1))).json();
    let pages = [
      ...Array.from(Array(Math.ceil(meta.total_count / 100) + 1).keys()),
    ].slice(1);
    for (const page of pages) {
      if (page == 1) {
        continue;
      }
      dictionary = [
        ...dictionary,
        ...(await (await fetch(requestPage(page))).json()).data,
      ];
    }

    dictionary.sort((left, right) => {
      // If the left value has no root, but the right one does, return right then left
      if (!left.root && right.root) {
        return RIGHT_LEFT;
      }
      // If the right value has no root, but the left one does, return left then right
      if (!right.root && left.root) {
        return LEFT_RIGHT;
      }
      // Compare order of first bones
      const alphaLeftBoneOne = alphaStrConvert(left.root.bone_one);
      const alphaRightBoneOne = alphaStrConvert(right.root.bone_one);
      if (alphaRightBoneOne < alphaLeftBoneOne) {
        return RIGHT_LEFT;
      } else if (alphaLeftBoneOne < alphaRightBoneOne) {
        return LEFT_RIGHT;
      }
      // Compare order of second bones
      const alphaLeftBoneTwo = alphaStrConvert(left.root.bone_two);
      const alphaRightBoneTwo = alphaStrConvert(right.root.bone_two);
      if (alphaRightBoneTwo < alphaLeftBoneTwo) {
        return RIGHT_LEFT;
      } else if (alphaLeftBoneTwo < alphaRightBoneTwo) {
        return LEFT_RIGHT;
      }
      // If the left value has no pattern, but the right one does, return right then left
      if (!left.pattern && right.pattern) {
        return RIGHT_LEFT;
      }
      // If the right value has no root, but the left one does, return left then right
      if (!right.pattern && left.pattern) {
        return LEFT_RIGHT;
      }
      // Compare the order of patterns
      if (
        left.pattern &&
        right.pattern &&
        right.pattern.number < left.pattern.number
      ) {
        return RIGHT_LEFT;
      } else if (
        left.pattern &&
        right.pattern &&
        left.pattern.number < right.pattern.number
      ) {
        return LEFT_RIGHT;
      }
      // After pattern ordering, compare the order of word alphabetically
      const leftWord = alphaStrConvert(left.word);
      const rightWord = alphaStrConvert(right.word);
      if (rightWord < leftWord) {
        return RIGHT_LEFT;
      } else if (leftWord < rightWord) {
        return LEFT_RIGHT;
      } else {
        return 0;
      }
    });
    dictdata = dictionary;
    window.localStorage.setItem("dictionaryData", JSON.stringify(dictdata));
    window.localStorage.setItem(
      "dictionaryTimeout",
      (time + 300000).toString()
    );
  } else {
    dictdata = data;
  }
  return dictdata;
}

export async function dictionary(path: string[]): Promise<TemplateResult> {
  if (path[0] == "word") {
    return await dictionaryWord(path.slice(1));
  }

  const wordsPerPage = 25;
  let search = new URLSearchParams(window.location.search);
  let bypassCache = (search.get("nocache") ?? "0") == "1";
  let dictionary = await getDictionaryData(bypassCache);

  let searchMode = search.get("searchmode") ?? "en";
  let searchString = search.get("search");
  if (searchString) {
    dictionary = dictionary.filter(({ word, definitions }) => {
      switch (searchMode) {
        case "nd":
          return word.toLowerCase().includes(searchString.toLowerCase());
        case "en":
          return definitions.some(({ definition }) =>
            definition.toLowerCase().includes(searchString.toLowerCase())
          );
      }
    });
  }

  let currentPage = parseInt(search.get("page") ?? "1");
  let pages = [
    ...Array.from(
      Array(Math.ceil(dictionary.length / wordsPerPage) + 1).keys()
    ),
  ].slice(1);
  dictionary = dictionary.slice(
    (currentPage - 1) * wordsPerPage,
    currentPage * wordsPerPage
  );

  const navPage = () => {
    const page = parseInt(
      (<HTMLSelectElement>document.querySelector("#dict_page_picker")).value
    );
    gotoPage(page)();
  };

  const gotoPage = (page) => () => {
    search.set("page", page.toString());
    window.location.search = search.toString();
  };

  const doSearch = () => {
    search.set("page", "1");
    search.set(
      "searchmode",
      (<HTMLSelectElement>document.querySelector(".dict_search__searchmode"))
        .value
    );
    search.set(
      "search",
      (<HTMLSelectElement>document.querySelector(".dict_search__search")).value
    );
    window.location.search = search.toString();
  };

  const clearSearch = () => {
    search.delete("searchmode");
    search.delete("search");
    search.set("page", "1");
    window.location.search = search.toString();
  };

  return html`
    ${card(
      "Search",
      html`
        <form class="dict_search" action="javascript:void(0);">
          <label class="dict_search__label" for="searchmode"> Mode </label>
          <label class="dict_search__label" for="search"> Search </label>
          <select class="dict_search__searchmode" name="searchmode">
            <option value="en">English</option>
            <option value="nd">Narish</option>
          </select>
          <input type="text" name="search" class="dict_search__search" />
          <input
            type="button"
            value="Clear"
            @click=${clearSearch}
            class="dict_search__clear"
          />
          <input
            type="submit"
            value="Search"
            @click=${doSearch}
            class="dict_search__submit"
          />
        </form>
      `
    )}
    ${card(
      "Dictionary",
      html`
        ${dictionary.map(
          (word) => html`
            <div class="dict_entry">
              <div class="dict_entry__word">
                <a href="/dictionary/word/${word.id}">${word.word}</a>
              </div>
              <div class="dict_entry__pos">${word.pos}</div>
              <ol
                class="dict_entry__defs ${
                  word.definitions.length > 1 ? "dict_entry__defs--many" : ""
                }"
              >
                ${word.definitions.map(
                  (definition, i) =>
                    html`<li class="dict_entry__def">
                      ${definition.definition}
                    </li>`
                )}
              </ul>
            </div>
          `
        )}
        <div class="card__actions">
          ${pages.includes(currentPage - 1)
            ? html`<a
                @click=${gotoPage(currentPage - 1)}
                href="javascript:void(0);"
                >&LeftArrow;</a
              >`
            : html`<a class="link--na">&LeftArrow;</a>`}
          <div>
            <select @input=${navPage} id="dict_page_picker">
              ${pages.map(
                (page) =>
                  html`<option
                    ?selected=${page == currentPage ? "selected" : ""}
                  >
                    ${page}
                  </option>`
              )}
            </select>
            of ${pages.length}
          </div>
          ${pages.includes(currentPage + 1)
            ? html`<a @click=${gotoPage(
                currentPage + 1
              )}" href="javascript:void(0);">&RightArrow;</a>`
            : html`<a class="link--na">&RightArrow;</a>`}
        </div>
      `
    )}
  `;
}

async function dictionaryWord(path: string[]): Promise<TemplateResult> {
  const wordId = parseInt(path[0]);
  const word = (
    await (
      await fetch(
        `${API}/items/words/${wordId}?fields=word,pos,root.bone_two,root.bone_one,pattern.name,definitions.definition,definitions.examples.narish,definitions.examples.english`
      )
    ).json()
  ).data;

  return card(
    `${word.word}`,
    html`
      <div class="word__position">${word.pos}</div>
      <div class="word__pattern">${word.pattern.name}</div>
      <div class="word__defs">
        ${word.definitions.map(
          ({ definition, examples }) => html`
            <div class="word__definition">${definition}</div>
            <div class="word__examples">
              ${examples.map(
                ({ english, narish }) => html`
                  <div class="word__example">
                    <div class="word__example__english">${english}</div>
                    <div class="word__example__narish">${narish}</div>
                  </div>
                `
              )}
            </div>
          `
        )}
      </div>
      <div class="card__actions">
        <a href="/dictionary">Back to dictionary</a>
      </div>
    `
  );
}
