import { useEffect, useState } from "react";
import { readRoute } from "./lib/routes.ts";
import { RecipeDetailPage } from "./pages/RecipeDetailPage.tsx";
import { RecipeListPage } from "./pages/RecipeListPage.tsx";
import "./App.css";

function useHashRoute() {
  const [state, setState] = useState(() => {
    const hash = window.location.hash || "#/";
    const route = readRoute(hash);
    return {
      route,
      backHref: route.kind === "list" ? hash : "#/",
    };
  });
  useEffect(() => {
    const handleChange = () => {
      const hash = window.location.hash || "#/";
      const route = readRoute(hash);
      setState((previous) => ({
        route,
        backHref: route.kind === "list" ? hash : previous.backHref,
      }));
    };
    window.addEventListener("hashchange", handleChange);
    return () => window.removeEventListener("hashchange", handleChange);
  }, []);
  return state;
}
function App() {
  const { route, backHref } = useHashRoute();
  const pageKey = route.kind === "detail" ? `recipe-${route.id}` : route.kind;
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = pageKey.startsWith("recipe-")
      ? "요리 보기 | 천개의 레시피"
      : "천개의 레시피";
  }, [pageKey]);
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#/" aria-label="천개의 레시피 처음으로">
            <span className="brand-mark" aria-hidden="true">
              ✳
            </span>
            천개의 레시피
          </a>
          <span className="header-caption">매일의 식탁에 작은 영감</span>
        </div>
      </header>
      <main id="main-content" className="site-main">
        {route.kind === "list" && (
          <RecipeListPage tags={route.tags} page={route.page} />
        )}
        {route.kind === "detail" && (
          <RecipeDetailPage
            key={route.id}
            recipeId={route.id}
            backHref={backHref}
          />
        )}
        {route.kind === "not-found" && (
          <div className="request-state">
            <p className="eyebrow">페이지를 찾을 수 없어요</p>
            <h1>다시 맛있는 요리를 찾아볼까요?</h1>
            <p>주소를 확인하거나 레시피 목록으로 돌아가 주세요.</p>
            <a className="button button-primary" href="#/">
              레시피 목록으로
            </a>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <p>천개의 레시피</p>
        <span>오늘도 맛있는 하루 보내세요.</span>
      </footer>
    </>
  );
}
export default App;
