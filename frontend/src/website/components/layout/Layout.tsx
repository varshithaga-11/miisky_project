import { useEffect, useState } from "react";
import BackToTop from "../elements/BackToTop";
import DataBg from "../elements/DataBg";
import Breadcrumb from "./Breadcrumb";
import SearchPopup from "./SearchPopup";
import SidebarPopup from "./SidebarPopup";
import Header1 from "./header/Header1";
import Header2 from "./header/Header2";
import Header3 from "./header/Header3";
import Footer1 from "./footer/Footer1";

type LayoutProps = {
  headerStyle?: 1 | 2 | 3;
  footerStyle?: 1;
  breadcrumbTitle?: string;
  children: React.ReactNode;
  wrapperCls?: string;
};

export default function Layout({
  headerStyle = 1,
  footerStyle = 1,
  breadcrumbTitle,
  children,
  wrapperCls,
}: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Mobile Menu
  const [isMobileMenu, setMobileMenu] = useState(false);
  const handleMobileMenu = () => {
    setMobileMenu((prev) => {
      const newState = !prev;
      newState
        ? document.body.classList.add("mobile-menu-visible")
        : document.body.classList.remove("mobile-menu-visible");
      return newState;
    });
  };

  // Search Popup
  const [isPopup, setPopup] = useState(false);
  const handlePopup = () => setPopup((p) => !p);

  // Sidebar Popup
  const [isSidebar, setSidebar] = useState(false);
  const handleSidebar = () => setSidebar((s) => !s);

  useEffect(() => {
    (async () => {
      // @ts-expect-error: WOW types not provided
      const { WOW } = await import("wowjs");
      const wow = new WOW({ live: false });
      wow.init();
    })();

    const onScroll = () => setIsScrolled(window.scrollY > 100);
    document.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("scroll", onScroll);
      document.body.classList.remove("mobile-menu-visible");
    };
  }, []);

  const renderHeader = () => {
    const headerProps = {
      scroll: isScrolled,
      isMobileMenu,
      handleMobileMenu,
      handlePopup,
      isSidebar,
      handleSidebar,
    };
    switch (headerStyle) {
      case 1:
        return <Header1 {...headerProps} />;
      case 2:
        return <Header2 {...headerProps} />;
      case 3:
        return <Header3 {...headerProps} />;
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (footerStyle) {
      case 1:
        return <Footer1 />;
      default:
        return null;
    }
  };

  return (
    <>
      <DataBg />
      <div className={`page-wrapper ${wrapperCls || ""}`} id="top">
        {renderHeader()}


        {/* Popups */}
        <SearchPopup isPopup={isPopup} handlePopup={handlePopup} />
        <SidebarPopup isOpen={isSidebar} onClose={handleSidebar} />

        {/* Breadcrumb */}
        {breadcrumbTitle && <Breadcrumb breadcrumbTitle={breadcrumbTitle} />}

        {/* Page Content */}
        {children}

        {renderFooter()}
      </div>
      <BackToTop scroll={isScrolled} />
    </>
  );
}
