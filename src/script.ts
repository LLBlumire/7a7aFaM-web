import "./style.styl";
import { sidebar } from "./component/sidebar";
import { main } from "./component/main";
import { html, render } from "lit-html";

export function setupRenderApp(to: HTMLElement) {
  async function renderApp() {
    render(html` ${await sidebar()}${await main()}`, to);
  }
  renderApp();
}
