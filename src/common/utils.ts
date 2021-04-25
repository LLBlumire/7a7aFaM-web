import { html, TemplateResult } from "lit-html";
import { until } from "lit/directives/until.js";
import { DBResult } from "./db";
import { WordData } from "./types";

export function onDbTable<I>(
  result: Promise<DBResult<I>>,
  render: (I) => TemplateResult,
  fallbackTemplate?: string | TemplateResult
): TemplateResult {
  const local = result.then((result) => render(result.local));
  const remote = result
    .then((result) => result.remote)
    .then((remote) => render(remote));
  const fallback = fallbackTemplate ?? html``;
  return html`${until(remote, local, fallback)}`;
}

export function narishAlphaStrConvert(input: string): string {
  return input
    .replace(/Ɂ/g, "@")
    .replace(/ɂ/g, "`")
    .replace(/Y/g, "J")
    .replace(/y/g, "j");
}
const LEFT_RIGHT = -1;
const RIGHT_LEFT = 1;

export function narishSort(left: WordData, right) {
  // If the left value has no root, but the right one does, return right then left
  if (!left.root && right.root) {
    return RIGHT_LEFT;
  }
  // If the right value has no root, but the left one does, return left then right
  if (!right.root && left.root) {
    return LEFT_RIGHT;
  }
  // Compare order of first bones
  const alphaLeftBoneOne = narishAlphaStrConvert(left.root.bone_one);
  const alphaRightBoneOne = narishAlphaStrConvert(right.root.bone_one);
  if (alphaRightBoneOne < alphaLeftBoneOne) {
    return RIGHT_LEFT;
  } else if (alphaLeftBoneOne < alphaRightBoneOne) {
    return LEFT_RIGHT;
  }
  // Compare order of second bones
  const alphaLeftBoneTwo = narishAlphaStrConvert(left.root.bone_two);
  const alphaRightBoneTwo = narishAlphaStrConvert(right.root.bone_two);
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
  const leftWord = narishAlphaStrConvert(left.word);
  const rightWord = narishAlphaStrConvert(right.word);
  if (rightWord < leftWord) {
    return RIGHT_LEFT;
  } else if (leftWord < rightWord) {
    return LEFT_RIGHT;
  } else {
    return 0;
  }
}
