import { useEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // document.documentElement.scrollTo(0, 0); // Backup for some browsers
  }, [pathname]);

  return null;
}
