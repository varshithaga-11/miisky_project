import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Image from "../../Image";
import MobileMenu from "../MobileMenu";
import { getDepartments } from "../../../../utils/api";

// ✅ Define props type
type Header2Props = {
  scroll: boolean;
  isMobileMenu: boolean;
  handleMobileMenu: () => void;
};

export default function Header2({ scroll, isMobileMenu, handleMobileMenu }: Header2Props) {
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDepartmentsData = async () => {
      try {
        const response = await getDepartments();
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments for header:", err);
      }
    };
    fetchDepartmentsData();
  }, []);

  const logout = () => {
    localStorage.removeItem("miisky_access_token");
    window.location.href = "/website/login";
  };

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
                  <a href="mailto:support@miisky.com">support@miisky.com</a>
                </li>
                <li>
                  <i className="icon-2"></i>
                  <Link to="/website/pricing">Pay your bill</Link>
                </li>
                <li>
                  <i className="icon-3"></i>
                  Open Hours: <span>Mon - Fri: 9:30am to 6:00pm</span>
                </li>
              </ul>
              <ul className="social-links clearfix">
                <li>
                  <h6>Follow Us</h6>
                </li>
                <li><Link to="/website"><i className="fab fa-facebook-f"></i></Link></li>
                <li><Link to="/website"><i className="fab fa-dribbble"></i></Link></li>
                <li><Link to="/website"><i className="fab fa-twitter"></i></Link></li>
                <li><Link to="/website"><i className="fab fa-instagram"></i></Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="header-lower">
          <div className="auto-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/website">
                    <Image src="/website/assets/images/logo-miisky.png" alt="Logo Image" width={203} height={40} priority />
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
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent2">
                    <ul className="navigation clearfix">
                       <li>
                        <Link to="/website">Home</Link>
                      </li>
                      <li>
                        <Link to="/website/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/departments">Departments</Link>
                        <ul>
                          <li><Link to="/website/departments">Our Departments</Link></li>
                          {departments.map((dept: any) => (
                            <li key={dept.id}>
                              <Link to={`/website/department-details/${dept.id}`}>{dept.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website">Pages</Link>
                        <ul>
                          <li><Link to="/website/doctors">Our Doctors</Link></li>
                          <li><Link to="/website/doctor-details">Doctor Details</Link></li>
                          <li><Link to="/website/portfolio">Portfolio One</Link></li>
                          <li><Link to="/website/portfolio-2">Portfolio Two</Link></li>
                          <li><Link to="/website/pricing">Pricing</Link></li>
                          <li><Link to="/website/error">Not Found</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/blog">Blog</Link>
                        <ul>
                          <li><Link to="/website/blog">Blog Grid</Link></li>
                          {/* <li><Link to="/website/blog-standard">Blog Standard</Link></li> */}
                          <li><Link to="/website/blog-details">Blog Details</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/website/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div className="support-box">
                  <div className="icon-box">
                    <Image src="/website/assets/images/icons/icon-1.svg" alt="Icon Image" width={25} height={25} priority />
                  </div>
                  <span>Emergency Call</span>
                  <h6>
                    <Link to="/website/contact" style={{ color: "inherit" }}>+91 9845497950</Link>
                  </h6>
                </div>
                <div className="btn-box">
                   <button
                    onClick={logout}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f5821f",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Logout
                  </button>
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
                  <Link to="/website">
                    <Image src="/website/assets/images/logo-miisky.png" alt="Logo Image" width={203} height={40} priority />
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
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent2Sticky">
                    <ul className="navigation clearfix">
                       <li>
                        <Link to="/website">Home</Link>
                      </li>
                      <li>
                        <Link to="/website/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/departments">Departments</Link>
                        <ul>
                          <li><Link to="/website/departments">Our Departments</Link></li>
                          {departments.map((dept: any) => (
                            <li key={dept.id}>
                              <Link to={`/website/department-details/${dept.id}`}>{dept.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website">Pages</Link>
                        <ul>
                          <li><Link to="/website/doctors">Our Doctors</Link></li>
                          <li><Link to="/website/doctor-details">Doctor Details</Link></li>
                          <li><Link to="/website/portfolio">Portfolio One</Link></li>
                          {/* <li><Link to="/website/portfolio-2">Portfolio Two</Link></li> */}
                          <li><Link to="/website/pricing">Pricing</Link></li>
                          <li><Link to="/website/error">Not Found</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/blog">Blog</Link>
                        <ul>
                          <li><Link to="/website/blog">Blog Grid</Link></li>
                          {/* <li><Link to="/website/blog-standard">Blog Standard</Link></li> */}
                          <li><Link to="/website/blog-details">Blog Details</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/website/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div className="support-box">
                  <div className="icon-box">
                    <Image src="/website/assets/images/icons/icon-1.svg" alt="Icon Image" width={25} height={25} priority />
                  </div>
                  <span>Emergency Call</span>
                  <h6>
                    <Link to="/website/contact" style={{ color: "inherit" }}>+91 9845497950</Link>
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Fixed MobileMenu props */}
        <MobileMenu
          isSidebar={isMobileMenu}
          handleMobileMenu={handleMobileMenu}
          handleSidebar={handleMobileMenu}
        />
      </header>
    </>
  );
}
