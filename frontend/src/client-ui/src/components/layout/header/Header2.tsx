import React from "react";
import { Link } from "react-router-dom";
import Image from "@/components/Image";
import MobileMenu from "../MobileMenu";

// ✅ Define props type
type Header1Props = {
  scroll: boolean;
  handleMobileMenu: () => void;
};

export default function Header2({ scroll, handleMobileMenu }: Header1Props) {
  return (
    <>
      {/* main header */}
      <header className={`main-header header-style-two ${scroll ? "fixed-header" : ""}`}>
        <div className="header-top">
          <div className="auto-container">
            <div className="top-inner">
              <ul className="info-list clearfix">
                <li>
                  <i className="icon-46"></i>
                  <a href="mailto:example@info.com">example@info.com</a>
                </li>
                <li>
                  <i className="icon-2"></i>
                  <Link to="/">Pay your bill</Link>
                </li>
                <li>
                  <i className="icon-3"></i>
                  Open Hours: <span>Mon - Fri: 8:00am to 5:00pm</span>
                </li>
              </ul>
              <ul className="social-links clearfix">
                <li>
                  <h6>Follow Us</h6>
                </li>
                <li>
                  <Link to="/"><i className="icon-4"></i></Link>
                </li>
                <li>
                  <Link to="/"><i className="icon-5"></i></Link>
                </li>
                <li>
                  <Link to="/"><i className="icon-6"></i></Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="header-lower">
          <div className="auto-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/">
                    <Image src="/assets/images/logo.png" alt="Logo Image" width={203} height={40} priority />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

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
                            <Link to="/department-details-3">Gastroenterology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-4">Neurology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-5">Orthopaedics</Link>
                          </li>
                          <li>
                            <Link to="/department-details-6">Modern Laboratory</Link>
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
                                <Link to="/doctor-details">Doctor Details</Link>
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
                <div className="support-box">
                  <div className="icon-box">
                    <Image src="/assets/images/icons/icon-1.svg" alt="Icon Image" width={25} height={25} priority />
                  </div>
                  <span>Emergency Call</span>
                  <h6>
                    <a href="tel:12463330088">+ 1 (246) 333-0088</a>
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* sticky header */}
        <div className={`sticky-header ${scroll ? "animated slideInDown" : ""}`}>
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/">
                    <Image src="/assets/images/logo.png" alt="Logo Image" width={203} height={40} priority />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

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
                            <Link to="/department-details-3">Gastroenterology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-4">Neurology</Link>
                          </li>
                          <li>
                            <Link to="/department-details-5">Orthopaedics</Link>
                          </li>
                          <li>
                            <Link to="/department-details-6">Modern Laboratory</Link>
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
                                <Link to="/doctor-details">Doctor Details</Link>
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
                <div className="support-box">
                  <div className="icon-box">
                    <Image src="/assets/images/icons/icon-1.svg" alt="Icon Image" width={25} height={25} priority />
                  </div>
                  <span>Emergency Call</span>
                  <h6>
                    <Link to="tel:12463330088">+ 1 (246) 333-0088</Link>
                  </h6>
                </div>
                <div className="btn-box">
                  <Link to="/" className="theme-btn btn-one">
                    <span>Appointment</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Fixed MobileMenu props */}
        <MobileMenu
          isSidebar={false}
          handleMobileMenu={handleMobileMenu}
          handleSidebar={() => {}}
        />
      </header>
    </>
  );
}
