import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Image from "../../Image";
import MobileMenu from "../MobileMenu";
import { getDepartments } from "../../../../utils/api";

// ✅ Define props type
type Header3Props = {
  scroll: boolean;
  isMobileMenu: boolean;
  handleMobileMenu: () => void;
  handlePopup: () => void;
  isSidebar: boolean;
  handleSidebar: () => void;
};

export default function Header3({
  scroll,
  isMobileMenu,
  handleMobileMenu,
  handleSidebar,
}: Header3Props) {
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
      <header
        className={`main-header header-style-three ${
          scroll ? "fixed-header" : ""
        }`}
      >
        <div className="header-lower">
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/website">
                    <Image
                      src="/website/assets/images/logo-miisky.png"
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

                {/* ✅ Desktop nav forced to show */}
                {/* Simplified Desktop nav */}
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent3">
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
                        <Link to="/website/medical-devices">Products</Link>
                        <ul>
                          <li><Link to="/website/medical-devices">Medical Devices</Link></li>
                          <li><Link to="/website/device-categories">Device Categories</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/research">Innovation</Link>
                        <ul>
                          <li><Link to="/website/research">Research</Link></li>
                          <li><Link to="/website/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website">Support</Link>
                        <ul>
                          <li><Link to="/website/doctors">Doctors</Link></li>
                          <li><Link to="/website/careers">Careers</Link></li>
                          <li><Link to="/website/faq">FAQ</Link></li>
                          <li><Link to="/website/gallery">Gallery</Link></li>
                          <li><Link to="/website/partners">Partners</Link></li>
                          <li><Link to="/website/pricing">Pricing</Link></li>
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
                <div className="btn-box">
                  <Link to="/website" className="theme-btn btn-one">
                    <span>Appointment</span>
                  </Link>
                  <button
                    onClick={logout}
                    style={{
                      marginLeft: "15px",
                      padding: "10px 24px",
                      borderColor: "#0646ac",
                      borderStyle: "solid",
                      borderWidth: "1.5px",
                      color: "#0646ac",
                      backgroundColor: "transparent",
                      borderRadius: "30px",
                      cursor: "pointer",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      transition: "all 0.3s ease",
                      textTransform: "uppercase"
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = "#0646ac";
                      (e.target as HTMLButtonElement).style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = "transparent";
                      (e.target as HTMLButtonElement).style.color = "#0646ac";
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
                    <Image
                      src="/website/assets/images/logo-miisky.png"
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
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent3Sticky">
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
                        <Link to="/website/medical-devices">Products</Link>
                        <ul>
                          <li><Link to="/website/medical-devices">Medical Devices</Link></li>
                          <li><Link to="/website/device-categories">Device Categories</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/research">Innovation</Link>
                        <ul>
                          <li><Link to="/website/research">Research</Link></li>
                          <li><Link to="/website/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website">Support</Link>
                        <ul>
                          <li><Link to="/website/doctors">Doctors</Link></li>
                          <li><Link to="/website/careers">Careers</Link></li>
                          <li><Link to="/website/faq">FAQ</Link></li>
                          <li><Link to="/website/gallery">Gallery</Link></li>
                          <li><Link to="/website/partners">Partners</Link></li>
                          <li><Link to="/website/pricing">Pricing</Link></li>
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
            </div>
          </div>
        </div>

        {/* ✅ Mobile menu */}
        <MobileMenu
          isSidebar={isMobileMenu}
          handleMobileMenu={handleMobileMenu}
          handleSidebar={handleSidebar}
        />
      </header>
    </>
  );
}
