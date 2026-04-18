import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Image from '@website/components/Image';
import MobileMenu from "../MobileMenu";
import { getDepartments } from '@/utils/api';

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
        let data = [];
        
        if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (response?.data?.results && Array.isArray(response.data.results)) {
          data = response.data.results;
        } else if (response?.data) {
          data = Array.isArray(response.data) ? response.data : [];
        }
        
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments for header:", err);
        setDepartments([]);
      }
    };
    fetchDepartmentsData();
  }, []);



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
                  <Link to="/">
                    <Image
                      src="/miisky-logo.png"
                      alt="Logo Image"
                      width={150}
                      height={30}
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
                       <li className="current">
                        <Link to="/">Home</Link>
                      </li>
                      <li>
                        <Link to="/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link to="/departments">Departments</Link>
                        <ul>
                          <li><Link to="/departments">Our Departments</Link></li>
                          {departments.map((dept: any) => (
                            <li key={dept.id}>
                              <Link to={`/department-details/${dept.uid || dept.id}`}>{dept.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/device-categories">Products</Link>
                        <ul>
                          <li><Link to="/device-categories">Device Categories</Link></li>
                          <li><Link to="/medical-devices">Medical Devices</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/research">Innovation</Link>
                        <ul>
                          <li><Link to="/research">Research</Link></li>
                          <li><Link to="/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Support</Link>
                        <ul>
                          <li><Link to="/doctors">Doctors</Link></li>
                          <li><Link to="/careers">Careers</Link></li>
                          <li><Link to="/faq">FAQ</Link></li>
                          <li><Link to="/gallery">Gallery</Link></li>
                          <li><Link to="/partners">Partners</Link></li>
                          <li><Link to="/pricing">Pricing</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/blog">Blog</Link>
                        <ul>
                          <li><Link to="/blog">Blog Grid</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
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
                    <Image
                      src="/miisky-logo.png"
                      alt="Logo Image"
                      width={150}
                      height={30}
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
                        <Link to="/">Home</Link>
                      </li>
                      <li>
                        <Link to="/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link to="/departments">Departments</Link>
                        <ul>
                          <li><Link to="/departments">Our Departments</Link></li>
                          {departments.map((dept: any) => (
                            <li key={dept.id}>
                              <Link to={`/department-details/${dept.uid || dept.id}`}>{dept.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/medical-devices">Products</Link>
                        <ul>
                          <li><Link to="/medical-devices">Medical Devices</Link></li>
                          <li><Link to="/device-categories">Device Categories</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/research">Innovation</Link>
                        <ul>
                          <li><Link to="/research">Research</Link></li>
                          <li><Link to="/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Support</Link>
                        <ul>
                          <li><Link to="/doctors">Doctors</Link></li>
                          <li><Link to="/careers">Careers</Link></li>
                          <li><Link to="/faq">FAQ</Link></li>
                          <li><Link to="/gallery">Gallery</Link></li>
                          <li><Link to="/partners">Partners</Link></li>
                          <li><Link to="/pricing">Pricing</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/blog">Blog</Link>
                        <ul>
                          <li><Link to="/blog">Blog Grid</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/contact">Contact</Link>
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
