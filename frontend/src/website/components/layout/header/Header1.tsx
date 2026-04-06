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
  useLocation();

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
          <div className="header-top">
            <div className="outer-container">
              <div className="top-inner">
                <ul className="info-list clearfix">
                  <li style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <i className="icon-46" style={{ position: 'static', transform: 'translateY(2px)' }}></i>
                    <a href="mailto:support@miisky.com">support@miisky.com</a>
                  </li>

                  <li style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <i className="icon-3" style={{ position: 'static', transform: 'translateY(2px)' }}></i>
                    Open Hours: <span>Mon - Fri: 9:30am to 6:00pm</span>
                  </li>
                </ul>

              </div>
            </div>
          </div>

        <div className="header-lower">
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link to="/" onClick={scrollToTop}>
                    <Image src="/miisky-logo.png" alt="Logo Image" width={150} height={30} priority />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu} style={{ padding: '4px' }}>
                  <i className="icon-bar" style={{ backgroundColor: "#111", width: '22px', height: '2px', margin: '4px 0' }}></i>
                  <i className="icon-bar" style={{ backgroundColor: "#111", width: '22px', height: '2px', margin: '4px 0' }}></i>
                  <i className="icon-bar" style={{ backgroundColor: "#111", width: '22px', height: '2px', margin: '4px 0' }}></i>
                </div>


                {/* Desktop nav simplified */}
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
                    <ul className="navigation clearfix" onClick={scrollToTop}>
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
                          <li><Link to="/medical-devices">Medical Devices</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/research">Innovation</Link>
                        <ul>
                          <li><Link to="/research">Research Papers</Link></li>
                          <li><Link to="/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Support</Link>
                        <ul>
                          <li><Link to="/doctors">Our Doctors</Link></li>
                          <li><Link to="/careers">Careers</Link></li>
                          <li><Link to="/faq">FAQ</Link></li>
                          <li><Link to="/gallery">Gallery</Link></li>
                          <li><Link to="/partners">Our Partners</Link></li>
                          <li><Link to="/plans">Plans</Link></li>
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
                      <li className="login-li" style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                        <Link to="/signin" className="theme-btn btn-one" style={{
                          padding: '8px 25px',
                          fontSize: '14px',
                          borderRadius: '5px',
                          height: 'auto',
                          lineHeight: '1.5',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          marginTop: '0',
                          color: '#fff',
                          display: 'inline-block'
                        }}>
                          Login
                        </Link>
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
                  <div className="content" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative', paddingLeft: '0px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 400, marginBottom: '2px' }}>Emergency Call</span>
                    <h6 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                      <Link to="tel:+919845497950" style={{ color: '#111', whiteSpace: 'nowrap' }}>+91 9845497950</Link>
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
                  <Link to="/" onClick={scrollToTop}>
                    <Image src="/miisky-logo.png" alt="Logo Image" width={150} height={30} priority />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu} style={{ padding: '4px' }}>
                  <i className="icon-bar" style={{ width: '22px', height: '2px', margin: '4px 0' }}></i>
                  <i className="icon-bar" style={{ width: '22px', height: '2px', margin: '4px 0' }}></i>
                  <i className="icon-bar" style={{ width: '22px', height: '2px', margin: '4px 0' }}></i>
                </div>


                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContentSticky">
                    <ul className="navigation clearfix" onClick={scrollToTop}>
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
                          <li><Link to="/medical-devices">Medical Devices</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/research">Innovation</Link>
                        <ul>
                          <li><Link to="/research">Research Papers</Link></li>
                          <li><Link to="/patents">Patents</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/">Support</Link>
                        <ul>
                          <li><Link to="/doctors">Our Doctors</Link></li>
                          <li><Link to="/careers">Careers</Link></li>
                          <li><Link to="/faq">FAQ</Link></li>
                          <li><Link to="/gallery">Gallery</Link></li>
                          <li><Link to="/partners">Our Partners</Link></li>
                          <li><Link to="/plans">Plans</Link></li>
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
                      <li className="login-li" style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                        <Link to="/signin" className="theme-btn btn-one" style={{
                          padding: '8px 25px',
                          fontSize: '14px',
                          borderRadius: '5px',
                          height: 'auto',
                          lineHeight: '1.5',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          marginTop: '0',
                          color: '#fff',
                          display: 'inline-block'
                        }}>
                          Login
                        </Link>
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
                  <div className="content" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative', paddingLeft: '0px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#aaaaaa', fontWeight: 400, marginBottom: '2px' }}>Emergency Call</span>
                    <h6 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                      <Link to="tel:+919845497950" style={{ color: '#111', whiteSpace: 'nowrap' }}>+91 9845497950</Link>
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
