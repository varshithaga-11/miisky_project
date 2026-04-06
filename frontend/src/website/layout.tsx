import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider, useLayout } from "./context/LayoutContext";
import Layout from "./components/layout/Layout";
import "./website.css";

export function GlobalLayoutWrapper() {
  const { headerStyle, footerStyle, breadcrumbTitle, setHeaderStyle } = useLayout();
  const { pathname } = useLocation();
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  useEffect(() => {
    setHeaderStyle(1);
  }, [setHeaderStyle]);

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <Layout headerStyle={headerStyle} footerStyle={footerStyle} breadcrumbTitle={breadcrumbTitle}>
      <Outlet />
    </Layout>
  );
}

export default function WebsiteLayout() {
  useEffect(() => {
    document.body.classList.add("website-active");
    
    // Tag the style element to allow identification for removal on other pages
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach(tag => {
      if (tag.innerHTML.includes('/* Website Global Styles */') || 
          tag.innerHTML.includes('website/assets/css/bootstrap.css')) {
        tag.setAttribute('data-website-styles', 'true');
      }
    });

    return () => {
      document.body.classList.remove("website-active");
    };
  }, []);

  return (
    <AuthProvider>
      <LayoutProvider>
        <div className="website-layout">
          <GlobalLayoutWrapper />
        </div>
      </LayoutProvider>
    </AuthProvider>
  );
}
