import { TemplateResult, html } from "lit-html";
import { API } from "../../util/consts";
import { card } from "../card";

let UPPERCASE = Array.from("ɁABCDEFHIJKLMNPQRSTUW");
let LOWERCASE = Array.from("ɂabcdefhijklmnpqrstuw");
let COLLATION = [...UPPERCASE, ...LOWERCASE];

const LEFT_RIGHT = -1;
const RIGHT_LEFT = 1;

function alphaStrConvert(input: string): string {
  return input
    .replace("Ɂ", "@")
    .replace("ɂ", "`")
    .replace("Y", "J")
    .replace("y", "j");
}

function cmp(a: string, b: string): -1 | 0 | 1 {
  if (a < b) {
    return -1;
  } else if (b < a) {
    return 1;
  } else {
    return 0;
  }
}

export async function dictionary(path: string[]): Promise<TemplateResult> {
  let dictionary = (
    await (
      await fetch(
        `${API}/items/words?fields=word,pattern.number,pos,definitions.definition,root.radical_one,root.radical_two,definitions.examples.narish,definitions.examples.english,id`
      )
    ).json()
  ).data;

  dictionary.sort((left, right) => {
    // If the left value has no root, return right then left
    if (!left.root) {
      return RIGHT_LEFT;
    }
    // If the right value has no root, but the left one does, return left then right
    if (!right.root) {
      return LEFT_RIGHT;
    }
    // Compare order of first radicals
    const alphaLeftRadicalOne = alphaStrConvert(left.root.radical_one);
    const alphaRightRadicalOne = alphaStrConvert(right.root.radical_one);
    if (alphaRightRadicalOne < alphaLeftRadicalOne) {
      return RIGHT_LEFT;
    } else if (alphaLeftRadicalOne < alphaRightRadicalOne) {
      return LEFT_RIGHT;
    }
    // Compare order of second radicals
    const alphaLeftRadicalTwo = alphaStrConvert(left.root.radical_two);
    const alphaRightRadicalTwo = alphaStrConvert(right.root.radical_two);
    if (alphaRightRadicalTwo < alphaLeftRadicalTwo) {
      return RIGHT_LEFT;
    } else if (alphaLeftRadicalTwo < alphaRightRadicalTwo) {
      return LEFT_RIGHT;
    }
    // If the left value has no pattern, return right then left
    if (!left.pattern) {
      return RIGHT_LEFT;
    }
    // If the right value has no root, but the left one does, return left then right
    if (!right.pattern) {
      return LEFT_RIGHT;
    }
    // Compare the order of patterns
    if (right.pattern.number < left.pattern.number) {
      return RIGHT_LEFT;
    } else if (left.pattern.number < right.pattern.number) {
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

  return card(
    "Dictionary",
    html` ${dictionary.map(
      (word) => html`
        <div class="dict_entry">
          <div class="dict_entry__word">
            <a href="/dictionary/${word.id}">${word.word}</a>
          </div>
          <div class="dict_entry__pos">${word.pos}</div>
          <ol
            class="dict_entry__defs ${
              word.definitions.length > 1 ? "dict_entry__defs--many" : ""
            }"
          >
            ${word.definitions.map(
              (definition, i) =>
                html`<li class="dict_entry__def">${definition.definition}</li>`
            )}
          </ul>
        </div>
      `
    )}`
  );
}
