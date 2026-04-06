import React, { useEffect } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { Outlet } from "react-router";
import MasterHeader from "./MasterHeader";
import Backdrop from "../Backdrop";
import MasterSidebar from "./MasterSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  useEffect(() => {
    // Disable website-specific styles to prevent leakage into the master dashboard
    const disableStyles = () => {
      const websiteStyles = document.querySelectorAll('style[data-website-styles="true"], link[data-website-styles="true"]');
      websiteStyles.forEach(tag => {
        if (tag instanceof HTMLStyleElement || tag instanceof HTMLLinkElement) {
          tag.disabled = true;
        }
      });
    };

    const enableStyles = () => {
      const websiteStyles = document.querySelectorAll('style[data-website-styles="true"], link[data-website-styles="true"]');
      websiteStyles.forEach(tag => {
        if (tag instanceof HTMLStyleElement || tag instanceof HTMLLinkElement) {
          tag.disabled = false;
        }
      });
    };

    disableStyles();
    
    // Sometimes styles take a moment to be tagged by WebsiteLayout if coming from there
    const timeout = setTimeout(disableStyles, 100);

    return () => {
      clearTimeout(timeout);
      enableStyles();
    };
  }, []);

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <MasterSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <MasterHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const MasterLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default MasterLayout;
