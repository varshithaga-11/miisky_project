import { useEffect, useState } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => setLoading(false);
    
    // Hide preloader when window is fully loaded
    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (!loading) return null;

  return (
    <div className="loader-wrap">
      <div className="preloader">
          <div id="handle-preloader" className="handle-preloader">
              <div className="animation-preloader">
                  <div className="load-inner">
                      <div className="spinner"></div>
                      <div className="txt-loading">
                          <span data-text-preloader="m" className="letters-loading">
                              m
                          </span>
                          <span data-text-preloader="e" className="letters-loading">
                              e
                          </span>
                          <span data-text-preloader="d" className="letters-loading">
                              d
                          </span>
                          <span data-text-preloader="i" className="letters-loading">
                              i
                          </span>
                          <span data-text-preloader="c" className="letters-loading">
                              c
                          </span>
                          <span data-text-preloader="i" className="letters-loading">
                              i
                          </span>
                          <span data-text-preloader="n" className="letters-loading">
                              n
                          </span>
                          <span data-text-preloader="s" className="letters-loading">
                              s
                          </span>
                          <span data-text-preloader="k" className="letters-loading">
                              k
                          </span>
                      </div>
                  </div>
              </div>  
          </div>
      </div>
  </div>
  );
}
