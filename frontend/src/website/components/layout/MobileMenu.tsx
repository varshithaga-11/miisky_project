import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Image from '@website/components/Image';
import { getMedicalDevicesWithLimit } from "@/utils/api";

type MobileMenuProps = {
  isSidebar: boolean;
  handleMobileMenu: () => void;
  handleSidebar: () => void;
};

export default function MobileMenu({ isSidebar, handleMobileMenu, handleSidebar }: MobileMenuProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
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
      } catch (err) {
        console.error("Failed to fetch medical devices for mobile menu:", err);
      }
    };
    fetchDevices();
  }, []);

  const toggleDropdown = (key: number) => {
    if (activeDropdown === key) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(key);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If clicking a dropdown toggle button, don't scroll or close menu
    if ((e.target as HTMLElement).closest('.dropdown-btn')) {
      return;
    }
    window.scrollTo(0, 0);
    handleMobileMenu();
  };

  return (
    <>
      {/* Mobile Menu */}
      <div className="mobile-menu">
        <div className="menu-backdrop" onClick={handleMobileMenu} />
        <div className="close-btn" onClick={handleMobileMenu}>
          <span className="far fa-times" />
        </div>
        <nav className="menu-box">
          <div className="nav-logo">
            <Link to="/"><Image src="/miisky-logo.png" alt="Logo Image" width={150} height={30} priority /></Link>
          </div>
          <div className="menu-outer">
            <ul className="navigation clearfix" onClick={handleClick}>

              {/* Home */}
              <li><Link to="/">Home</Link></li>

              {/* About Us */}
              <li className={`dropdown ${activeDropdown === 1 ? "active" : ""}`}>
                <Link to="/about">About Us</Link>
                <ul className="sub-menu">
                  <li><Link to="/about">Incorporation</Link></li>
                  <li><Link to="/about#work">Work till now</Link></li>
                  <li><Link to="/about#vision">Vision</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 1 ? "open" : ""}`} onClick={() => toggleDropdown(1)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* EcoSystem */}
              <li className={`dropdown ${activeDropdown === 2 ? "active" : ""}`}>
                <Link to="/device-categories">EcoSystem</Link>
                <ul className="sub-menu">
                  <li className={`dropdown ${activeDropdown === 20 ? "active" : ""}`} style={{ position: 'relative' }}>
                    <Link to="/device-categories">Products</Link>
                    {devices.length > 0 && (
                      <ul className="sub-menu" style={{ display: activeDropdown === 20 ? 'block' : 'none' }}>
                        {devices.map((device) => (
                          <li key={device.uid || device.id}>
                            <Link to={`/medical-devices/${device.uid}`}>{device.name}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {devices.length > 0 && (
                      <div 
                        className={`dropdown-btn ${activeDropdown === 20 ? "open" : ""}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleDropdown(20);
                        }}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '6px',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 10
                        }}
                      >
                        <span className="fa fa-angle-right" />
                      </div>
                    )}
                  </li>
                  <li><Link to="/departments">Services</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 2 ? "open" : ""}`} onClick={() => toggleDropdown(2)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Collaborations */}
              <li className={`dropdown ${activeDropdown === 3 ? "active" : ""}`}>
                <Link to="/research">Collaborations</Link>
                <ul className="sub-menu">
                  <li><Link to="/research">Innovation</Link></li>
                  <li><Link to="/patents">Patent</Link></li>
                  <li><Link to="/partners">Collaration</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 3 ? "open" : ""}`} onClick={() => toggleDropdown(3)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Blog */}
              <li><Link to="/blog">Blog</Link></li>

              {/* Career */}
              <li><Link to="/careers">Career</Link></li>

              {/* Contact Us */}
              <li><Link to="/contact">Contact Us</Link></li>

              {/* Registration & Login */}
              <li style={{ padding: '15px 25px 0 25px', display: 'flex', gap: '10px' }}>
                <Link to="/signup" reloadDocument className="theme-btn btn-one" style={{ 
                  flex: 1, 
                  padding: '10px 0', 
                  borderRadius: '5px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  display: 'block',
                  textAlign: 'center'
                }}>
                  Register
                </Link>
                <Link to="/signin" reloadDocument className="theme-btn btn-one" style={{ 
                  flex: 1, 
                  padding: '10px 0', 
                  borderRadius: '5px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  display: 'block',
                  textAlign: 'center'
                }}>
                  Login
                </Link>
              </li>

            </ul>
          </div>

          <div className="contact-info">
              <h4>Contact Info</h4>
              <ul>
                  <li>#211, Temple Street, 9th Main Road, BEML III Stage, Rajarajeswarinagar, Bengaluru - 560098</li>
                  <li><Link to="tel:+919845497950">+91 9845497950</Link></li>
                  <li><Link to="mailto:support@miisky.com">support@miisky.com</Link></li>
              </ul>
          </div>

          {/* Social Links */}
          <div className="social-links">
            <ul className="clearfix">
              <li><Link to="/"><span className="fab fa-twitter" /></Link></li>
              <li><Link to="/"><span className="fab fa-facebook-square" /></Link></li>
              <li><Link to="/"><span className="fab fa-pinterest-p" /></Link></li>
              <li><Link to="/"><span className="fab fa-instagram" /></Link></li>
              <li><Link to="/"><span className="fab fa-youtube" /></Link></li>
            </ul>
          </div>

        </nav>
      </div>

      {/* Overlay */}
      <div
        className="nav-overlay"
        style={{ display: isSidebar ? "block" : "none" }}
        onClick={handleSidebar}
      />
    </>
  );
}
