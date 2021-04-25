import { html, TemplateResult } from "lit-html";
import { PAGES_LINK_MAP } from "./db";
import { Page } from "./types";
import { onDbTable } from "./utils";

export interface Route {
  route?: (path: string[]) => TemplateResult;
  path: string;
  children?: Route[];
}

function defaultFallback(path: string[]): TemplateResult {
  return html`<vli-card heading="Error 404"
    ><span
      >The page <code>/${path.join("/")}</code> cannot be found.</span
    ></vli-card
  >`;
}

export function route(
  path: string[],
  routes: Route[],
  fallback?: (path: string[]) => TemplateResult
): TemplateResult {
  const setFallback = fallback
    ? () => fallback(path)
    : () => defaultFallback(path);
  const pathmap = routes.reduce(
    (map, route) => map.set(route.path, route),
    new Map<string, Route>()
  );
  const [pathHead, ...pathTail] = path;
  if (pathHead !== undefined) {
    const rootRoute = pathmap.get(pathHead) ?? pathmap.get("*");
    if (rootRoute === undefined) {
      throw new RouteNotFoundError(path);
    }
    if (pathTail.length > 0) {
      try {
        return route(pathTail, rootRoute.children, setFallback);
      } catch (e) {
        if (!(e instanceof RouteNotFoundError)) {
          throw e;
        }
      }
    }
    if (rootRoute.route !== undefined) {
      return rootRoute.route(path);
    }
  }
  return setFallback();
}
export class RouteNotFoundError extends Error {
  path: string[];
  constructor(path: string[], ...params) {
    super(...params);
    this.path = path;
  }
}

type RouteMap = {
  [path: string]: RouteMap;
};
// type RouteMap = Map<string, { route?: Route; children?: RouteMap }>;

function buildStaticRoutes(pages: Map<string, Page>): Route[] {
  let routeMap: RouteMap = {};
  for (let pathStr of pages.keys()) {
    let path = pathStr.split("/");
    let routeRoot = routeMap;
    for (let pathPart of path) {
      routeRoot[pathPart] = {};
      routeRoot = routeRoot[pathPart];
    }
  }
  return expandStaticRouteMap(routeMap, pages);
}
function expandStaticRouteMap(
  routeMap: RouteMap,
  pages: Map<string, Page>,
  path?: string[]
): Route[] {
  let thePath = path ?? [];
  return Object.keys(routeMap).map((child) => {
    let page = pages.get([...thePath, child].join("/"));
    let displayStaticPage = page
      ? () => html`<vli-static-page .content=${page}></vli-static-page>`
      : undefined;

    return {
      path: child,
      children: expandStaticRouteMap(
        routeMap[child],
        pages,
        thePath.concat([child])
      ),
      route: displayStaticPage,
    };
  });
}

export function dispatchRouting(): TemplateResult {
  return onDbTable(PAGES_LINK_MAP, (pages) => {
    const path = window.location.pathname.split("/").slice(1);
    const staticRoutes = buildStaticRoutes(pages);
    try {
      return route(path, [
        ...staticRoutes,
        {
          path: "dictionary",
          route: (path) =>
            html`<vli-dictionary .path="${path}"></vli-dictionary>`,
          children: [
            {
              path: "word",
              children: [
                {
                  path: "*",
                  route: (path) =>
                    html`<vli-word-data
                      .word="${parseInt(path[0])}"
                    ></vli-word-data>`,
                },
              ],
            },
          ],
        },
        {
          path: "lesson",
          children: [
            {
              path: "*",
              route: (path) =>
                html`<vli-lesson .number="${parseInt(path[0])}"></vli-lesson>`,
            },
          ],
        },
      ]);
    } catch {
      return html`
        <vli-card heading="Loading">
          The website is currently updating, please wait a moment. You do not
          need to refresh.
        </vli-card>
      `;
    }
  });
}
