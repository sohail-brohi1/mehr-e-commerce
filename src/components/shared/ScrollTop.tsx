import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.replace("#", ""));
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (tries++ < 40) requestAnimationFrame(tick);
    };
    tick();
  }, [pathname, hash]);
  return null;
}
