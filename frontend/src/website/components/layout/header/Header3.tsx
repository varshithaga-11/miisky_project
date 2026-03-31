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
