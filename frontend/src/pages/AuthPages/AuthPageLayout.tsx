import React, { useEffect } from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Disable website-specific styles to prevent pollution/leakage
    const websiteStyles = document.querySelectorAll('style[data-website-styles="true"], link[data-website-styles="true"]');
    websiteStyles.forEach(tag => {
      if (tag instanceof HTMLStyleElement || tag instanceof HTMLLinkElement) {
        tag.disabled = true;
      }
    });

    return () => {
      // Re-enable when leaving auth pages
      websiteStyles.forEach(tag => {
        if (tag instanceof HTMLStyleElement || tag instanceof HTMLLinkElement) {
          tag.disabled = false;
        }
      });
    };
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-4 text-center">
                <img
                  src="/miisky-logo.png"
                  alt="Miisky Logo"
                  className="h-12 w-auto mx-auto"
                />
              </div>
              <p className="text-center text-gray-400 dark:text-white/60 italic mt-2">
                "Management Of "
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
