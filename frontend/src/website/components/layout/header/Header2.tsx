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
                  <i className="icon-3"></i>
                  Open Hours: <span>Mon - Fri: 9:30am to 6:00pm</span>
                </li>
              </ul>
              <ul className="social-links clearfix">
                <li>
                  <h6>Follow Us</h6>
                </li>
                <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                <li><Link to="/"><i className="fab fa-instagram"></i></Link></li>
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
                    <Image src="/miisky-logo.png" alt="Logo Image" width={150} height={30} priority />
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
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Pages</Link>
                        <ul>
                          <li><Link to="/doctors">Our Doctors</Link></li>
                          <li><Link to="/doctor-details">Doctor Details</Link></li>
                          <li><Link to="/portfolio">Portfolio One</Link></li>
                          <li><Link to="/portfolio-2">Portfolio Two</Link></li>
                          <li><Link to="/pricing">Pricing</Link></li>
                          <li><Link to="/error">Not Found</Link></li>
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

              <div className="menu-right-content">
                <div className="support-box" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <div className="icon-box" style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#fba354', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: '15px',
                      flexShrink: 0,
                      position: 'relative'
                  }}>
                    <Image src="/website/assets/images/icons/icon-1.svg" alt="Icon" width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div className="content" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative' }}>
                    <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 400, marginBottom: '2px' }}>Emergency Call</span>
                    <h6 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                       <Link to="tel:+919845497950" style={{ color: '#111' }}>+91 9845497950</Link>
                    </h6>
                  </div>
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
                    <Image src="/miisky-logo.png" alt="Logo Image" width={150} height={30} priority />
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
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Pages</Link>
                        <ul>
                          <li><Link to="/doctors">Our Doctors</Link></li>
                          <li><Link to="/doctor-details">Doctor Details</Link></li>
                          <li><Link to="/portfolio">Portfolio One</Link></li>
                          {/* <li><Link to="/portfolio-2">Portfolio Two</Link></li> */}
                          <li><Link to="/pricing">Pricing</Link></li>
                          <li><Link to="/error">Not Found</Link></li>
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

              <div className="menu-right-content">
                <div className="support-box" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="icon-box" style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#fba354', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: '15px',
                      flexShrink: 0
                  }}>
                    <Image src="/website/assets/images/icons/icon-1.svg" alt="Icon" width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div className="content" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 400, marginBottom: '2px' }}>Emergency Call</span>
                    <h6 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                       <Link to="tel:+919845497950" style={{ color: '#111' }}>+91 9845497950</Link>
                    </h6>
                  </div>
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
