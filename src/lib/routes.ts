type Route =
  | {
      kind: "list";
      tags: string[];
      page: number;
    }
  | {
      kind: "detail";
      id: number;
    }
  | {
      kind: "not-found";
    };
export function readRoute(hash: string): Route {
  try {
    const url = new URL(hash.replace(/^#/, "") || "/", "https://recipes.local");
    if (url.pathname === "/") {
      const rawPage = Number(url.searchParams.get("page") || "1");
      return {
        kind: "list",
        tags: [...new Set(url.searchParams.getAll("tag"))],
        page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
      };
    }
    const match = url.pathname.match(/^\/recipes\/(\d+)\/?$/);
    if (match) {
      const id = Number(match[1]);
      if (Number.isSafeInteger(id) && id > 0)
        return {
          kind: "detail",
          id,
        };
    }
  } catch {
    // 잘못된 주소는 안내 화면으로 보냅니다.
  }
  return {
    kind: "not-found",
  };
}
export function listHref(tags: string[] = [], page = 1): string {
  const params = new URLSearchParams();
  for (const tag of tags) params.append("tag", tag);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `#/?${query}` : "#/";
}
export function detailHref(id: number): string {
  return `#/recipes/${id}`;
}
