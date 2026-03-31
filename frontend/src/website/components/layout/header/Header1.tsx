import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Image from "../../Image";
import MobileMenu from "../MobileMenu";
import { getDepartments } from "../../../../utils/api";

// ✅ Define props type
type Header1Props = {
  scroll: boolean;
  isMobileMenu: boolean;
  handleMobileMenu: () => void;
};

export default function Header1({ scroll, isMobileMenu, handleMobileMenu }: Header1Props) {
  const [departments, setDepartments] = useState<any[]>([]);
  const { pathname } = useLocation();
  const isHomePage = pathname === "/website" || pathname === "/website/";

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


  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* main header */}
      <header className={`main-header ${scroll ? "fixed-header" : ""}`}>
        {isHomePage && (
          <div className="header-top">
            <div className="outer-container">
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
                  <li>
                    <Link to="/website"><i className="fab fa-facebook-f"></i></Link>
                  </li>
                  <li>
                    <Link to="/website"><i className="fab fa-dribbble"></i></Link>
                  </li>
                  <li>
                    <Link to="/website"><i className="fab fa-twitter"></i></Link>
                  </li>
                  <li>
                    <Link to="/website"><i className="fab fa-instagram"></i></Link>
                  </li>

                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="header-lower">
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/website" onClick={scrollToTop}>
                    <Image src="/miisky-logo.png" alt="Logo Image" width={203} height={40} priority />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar" style={{ backgroundColor: "#111" }}></i>
                  <i className="icon-bar" style={{ backgroundColor: "#111" }}></i>
                  <i className="icon-bar" style={{ backgroundColor: "#111" }}></i>
                </div>

                {/* Desktop nav simplified */}
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
                    <ul className="navigation clearfix" onClick={scrollToTop}>
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
                          <li><Link to="/website/research">Research Papers</Link></li>
                          <li><Link to="/website/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website">Support</Link>
                        <ul>
                          <li><Link to="/website/doctors">Our Doctors</Link></li>
                          <li><Link to="/website/careers">Careers</Link></li>
                          <li><Link to="/website/faq">FAQ</Link></li>
                          <li><Link to="/website/gallery">Gallery</Link></li>
                          <li><Link to="/website/partners">Our Partners</Link></li>
                          <li><Link to="/website/pricing">Pricing</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/blog">Blog</Link>
                        <ul>
                          <li><Link to="/website/blog">Blog Grid</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/website/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              {isHomePage && (
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
                    <div className="content" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative', paddingLeft: '0px' }}>
                      <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 400, marginBottom: '2px' }}>Emergency Call</span>
                      <h6 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                        <Link to="tel:+919845497950" style={{ color: '#111' }}>+91 9845497950</Link>
                      </h6>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* sticky header */}
        <div className={`sticky-header ${scroll ? "animated slideInDown" : ""}`}>
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/website" onClick={scrollToTop}>
                    <Image src="/miisky-logo.png" alt="Logo Image" width={203} height={40} priority />
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
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContentSticky">
                    <ul className="navigation clearfix" onClick={scrollToTop}>
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
                          <li><Link to="/website/research">Research Papers</Link></li>
                          <li><Link to="/website/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website">Support</Link>
                        <ul>
                          <li><Link to="/website/doctors">Our Doctors</Link></li>
                          <li><Link to="/website/careers">Careers</Link></li>
                          <li><Link to="/website/faq">FAQ</Link></li>
                          <li><Link to="/website/gallery">Gallery</Link></li>
                          <li><Link to="/website/partners">Our Partners</Link></li>
                          <li><Link to="/website/pricing">Pricing</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/website/blog">Blog</Link>
                        <ul>
                          <li><Link to="/website/blog">Blog Grid</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/website/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              {isHomePage && (
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
                    <div className="content" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative', paddingLeft: '0px' }}>
                      <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 400, marginBottom: '2px' }}>Emergency Call</span>
                      <h6 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                        <Link to="tel:+919845497950" style={{ color: '#111' }}>+91 9845497950</Link>
                      </h6>
                    </div>
                  </div>
                </div>
              )}
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
