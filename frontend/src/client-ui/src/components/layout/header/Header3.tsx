import React from "react";
import { Link } from "react-router-dom";
import Image from "@/components/Image";
import MobileMenu from "../MobileMenu";

// ✅ Define props type
type Header3Props = {
  scroll: boolean;
  handleMobileMenu: () => void;
  handlePopup: () => void;
  isSidebar: boolean;
  handleSidebar: () => void;
};

export default function Header3({
  scroll,
  handleMobileMenu,
  handlePopup,
  isSidebar,
  handleSidebar,
}: Header3Props) {
  return (
    <>
      {/* main header */}
      <header
        className={`main-header header-style-three ${
          scroll ? "fixed-header" : ""
        }`}
      >
        <div className="header-lower">
          <div className="auto-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/">
                    <Image
                      src="/assets/images/logo-2.png"
                      alt="Logo Image"
                      width={203}
                      height={40}
                      priority
                    />
                  </Link>
                </figure>
              </div>

              <div className="menu-area">
                {/* ✅ Mobile menu toggler */}
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

                {/* ✅ Desktop nav */}
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    <ul className="navigation clearfix">
                      <li className="current dropdown">
                        <Link to="/">Home</Link>
                        <ul>
                          <li>
                            <Link to="/">Home Page One</Link>
                          </li>
                          <li>
                            <Link to="/index-2">Home Page Two</Link>
                          </li>
                          <li>
                            <Link to="/index-3">Home Page Three</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link to="/departments">Departments</Link>
                        <ul>
                          <li>
                            <Link to="/departments">Our Departments</Link>
                          </li>
                          <li>
                            <Link to="/department-details">Cardiology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-2">Dental</Link>
                          </li>
                          <li>
                            <Link to="/department-details-3">
                              Gastroenterology
                            </Link>
                          </li>
                          <li>
                            <Link to="/department-details-4">Neurology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-5">
                              Orthopaedics
                            </Link>
                          </li>
                          <li>
                            <Link to="/department-details-6">
                              Modern Laboratory
                            </Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Pages</Link>
                        <ul>
                          <li className="dropdown">
                            <Link to="/">Doctors</Link>
                            <ul>
                              <li>
                                <Link to="/doctors">Our Doctors</Link>
                              </li>
                              <li>
                                <Link to="/doctor-details">
                                  Doctor Details
                                </Link>
                              </li>
                            </ul>
                          </li>
                          <li className="dropdown">
                            <Link to="/">Portfolio</Link>
                            <ul>
                              <li>
                                <Link to="/portfolio">Portfolio One</Link>
                              </li>
                              <li>
                                <Link to="/portfolio-2">Portfolio Two</Link>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Link to="/pricing">Pricing</Link>
                          </li>
                          <li>
                            <Link to="/error">Page Not Found</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Blog</Link>
                        <ul>
                          <li>
                            <Link to="/blog">Blog Grid</Link>
                          </li>
                          <li>
                            <Link to="/blog-2">Blog Standard</Link>
                          </li>
                          <li>
                            <Link to="/blog-details">Blog Details</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              {/* ✅ Right icons */}
              <div className="menu-right-content">
                <div
                  className="search-box-outer search-toggler"
                  onClick={handlePopup}
                >
                  <Image
                    src="/assets/images/icons/icon-9.svg"
                    alt="Search Icon"
                    width={20}
                    height={20}
                    priority
                  />
                </div>
                <div
                  className="nav-btn nav-toggler navSidebar-button clearfix"
                  onClick={handleSidebar}
                >
                  <Image
                    src="/assets/images/icons/icon-10.svg"
                    alt="Sidebar Icon"
                    width={18}
                    height={16}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* sticky header */}
        <div
          className={`sticky-header ${scroll ? "animated slideInDown" : ""}`}
        >
          <div className="auto-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/">
                    <Image
                      src="/assets/images/logo-2.png"
                      alt="Logo Image"
                      width={203}
                      height={40}
                      priority
                    />
                  </Link>
                </figure>
              </div>

              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>
                {/* ✅ Sticky nav uses same structure */}
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    {/* 🔁 Same nav links (can refactor later into a map) */}
                    <ul className="navigation clearfix">
                      <li className="current dropdown">
                        <Link to="/">Home</Link>
                        <ul>
                          <li>
                            <Link to="/">Home Page One</Link>
                          </li>
                          <li>
                            <Link to="/index-2">Home Page Two</Link>
                          </li>
                          <li>
                            <Link to="/index-3">Home Page Three</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link to="/departments">Departments</Link>
                        <ul>
                          <li>
                            <Link to="/departments">Our Departments</Link>
                          </li>
                          <li>
                            <Link to="/department-details">Cardiology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-2">Dental</Link>
                          </li>
                          <li>
                            <Link to="/department-details-3">
                              Gastroenterology
                            </Link>
                          </li>
                          <li>
                            <Link to="/department-details-4">Neurology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-5">
                              Orthopaedics
                            </Link>
                          </li>
                          <li>
                            <Link to="/department-details-6">
                              Modern Laboratory
                            </Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Pages</Link>
                        <ul>
                          <li className="dropdown">
                            <Link to="/">Doctors</Link>
                            <ul>
                              <li>
                                <Link to="/doctors">Our Doctors</Link>
                              </li>
                              <li>
                                <Link to="/doctor-details">
                                  Doctor Details
                                </Link>
                              </li>
                            </ul>
                          </li>
                          <li className="dropdown">
                            <Link to="/">Portfolio</Link>
                            <ul>
                              <li>
                                <Link to="/portfolio">Portfolio One</Link>
                              </li>
                              <li>
                                <Link to="/portfolio-2">Portfolio Two</Link>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Link to="/pricing">Pricing</Link>
                          </li>
                          <li>
                            <Link to="/error">Page Not Found</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Blog</Link>
                        <ul>
                          <li>
                            <Link to="/blog">Blog Grid</Link>
                          </li>
                          <li>
                            <Link to="/blog-2">Blog Standard</Link>
                          </li>
                          <li>
                            <Link to="/blog-details">Blog Details</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div
                  className="search-box-outer search-toggler"
                  onClick={handlePopup}
                >
                  <Image
                    src="/assets/images/icons/icon-9.svg"
                    alt="Search Icon"
                    width={20}
                    height={20}
                    priority
                  />
                </div>
                <div
                  className="nav-btn nav-toggler navSidebar-button clearfix"
                  onClick={handleSidebar}
                >
                  <Image
                    src="/assets/images/icons/icon-10.svg"
                    alt="Sidebar Icon"
                    width={18}
                    height={16}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Pass props properly to MobileMenu */}
        <MobileMenu
          isSidebar={isSidebar}
          handleMobileMenu={handleMobileMenu}
          handleSidebar={handleSidebar}
        />
      </header>
    </>
  );
}
