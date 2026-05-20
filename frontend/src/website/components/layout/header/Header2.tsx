import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Image from '@website/components/Image';
import MobileMenu from "../MobileMenu";
import { getDepartments, getMedicalDevicesWithLimit } from '@/utils/api';

// ✅ Define props type
type Header2Props = {
  scroll: boolean;
  isMobileMenu: boolean;
  handleMobileMenu: () => void;
};

export default function Header2({ scroll, isMobileMenu, handleMobileMenu }: Header2Props) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [hasLoadedDevices, setHasLoadedDevices] = useState(false);

  const handleProductsHover = async () => {
    if (hasLoadedDevices) return;
    try {
      const response = await getMedicalDevicesWithLimit(1, 10);
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (response?.data?.results && Array.isArray(response.data.results)) {
        data = response.data.results;
      } else if (response?.data) {
        data = Array.isArray(response.data) ? response.data : [];
      }
      setDevices(data);
      setHasLoadedDevices(true);
    } catch (err) {
      console.error("Failed to fetch medical devices for header:", err);
    }
  };

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
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-user-plus" style={{ position: 'static', transform: 'translateY(2px)', color: '#fff' }}></i>
                  <Link to="/signup" reloadDocument style={{ color: '#fff' }}>Registration</Link>
                </li>
              </ul>
              <ul className="info-list clearfix" style={{ float: 'right', display: 'flex', alignItems: 'center', margin: 0 }}>
                <li style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0, paddingLeft: 0 }}>
                  <i className="fas fa-sign-in-alt" style={{ position: 'static', transform: 'translateY(2px)', color: '#fff' }}></i>
                  <Link to="/signin" reloadDocument style={{ color: '#fff' }}>Login</Link>
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
                      <li className="dropdown">
                        <Link to="/about">About Us</Link>
                        <ul>
                          <li><Link to="/about">Incorporation</Link></li>
                          <li><Link to="/about#work">Work till now</Link></li>
                          <li><Link to="/about#vision">Vision</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/device-categories">EcoSystem</Link>
                        <ul>
                          <li className="dropdown" onMouseEnter={handleProductsHover}>
                            <Link to="/device-categories">Products</Link>
                            {devices.length > 0 && (
                              <ul>
                                {devices.map((device) => (
                                  <li key={device.uid || device.id}>
                                    <Link to={`/medical-devices/${device.uid}`}>{device.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                          <li><Link to="/departments">Services</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/research">Collaborations</Link>
                        <ul>
                          <li><Link to="/research">Innovation</Link></li>
                          <li><Link to="/patents">Patent</Link></li>
                          <li><Link to="/partners">Collaration</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/blog">Blog</Link>
                      </li>
                      <li>
                        <Link to="/careers">Career</Link>
                      </li>
                      <li>
                        <Link to="/contact">Contact Us</Link>
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
                      <li className="dropdown">
                        <Link to="/about">About Us</Link>
                        <ul>
                          <li><Link to="/about">Incorporation</Link></li>
                          <li><Link to="/about#work">Work till now</Link></li>
                          <li><Link to="/about#vision">Vision</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/device-categories">EcoSystem</Link>
                        <ul>
                          <li className="dropdown" onMouseEnter={handleProductsHover}>
                            <Link to="/device-categories">Products</Link>
                            {devices.length > 0 && (
                              <ul>
                                {devices.map((device) => (
                                  <li key={device.uid || device.id}>
                                    <Link to={`/medical-devices/${device.uid}`}>{device.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                          <li><Link to="/departments">Services</Link></li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link to="/research">Collaborations</Link>
                        <ul>
                          <li><Link to="/research">Innovation</Link></li>
                          <li><Link to="/patents">Patent</Link></li>
                          <li><Link to="/partners">Collaration</Link></li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/blog">Blog</Link>
                      </li>
                      <li>
                        <Link to="/careers">Career</Link>
                      </li>
                      <li>
                        <Link to="/contact">Contact Us</Link>
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
