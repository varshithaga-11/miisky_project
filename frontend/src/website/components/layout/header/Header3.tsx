import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Image from '@website/components/Image';
import MobileMenu from "../MobileMenu";
import { getDepartments, getMedicalDevicesWithLimit } from '@/utils/api';

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
