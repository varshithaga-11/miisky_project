import { Link } from "react-router-dom";
import Image from "../Image";
import { useState } from "react";

type MobileMenuProps = {
  isSidebar: boolean;
  handleMobileMenu: () => void;
  handleSidebar: () => void;
};

export default function MobileMenu({ isSidebar, handleMobileMenu, handleSidebar }: MobileMenuProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const toggleDropdown = (key: number) => {
    if (activeDropdown === key) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(key);
    }
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
            <Link to="/website"><Image src="/website/assets/images/logo-miisky.png" alt="Logo Image" width={203} height={40} priority /></Link>
          </div>
          <div className="menu-outer">
            <ul className="navigation clearfix">

              {/* Home */}
              <li className={`dropdown ${activeDropdown === 1 ? "current" : ""}`}>
                <Link to="/website">Home</Link>
                <ul style={{ display: activeDropdown === 1 ? "block" : "none" }}>
                  <li><Link to="/website">Home Page One</Link></li>
                  {/* <li><Link to="/website/index-2">Home Page Two</Link></li>
                  <li><Link to="/website/index-3">Home Page Three</Link></li> */}
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 1 ? "open" : ""}`} onClick={() => toggleDropdown(1)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* About */}
              <li><Link to="/website/about">About Us</Link></li>

              {/* Services */}
              <li className={`dropdown ${activeDropdown === 2 ? "current" : ""}`}>
                <Link to="/website">Departments</Link>
                <ul style={{ display: activeDropdown === 2 ? "block" : "none" }}>
                  <li><Link to="/website/departments">Our Departments</Link></li>
                  <li><Link to="/website/department-details">Cardiology</Link></li>
                  {/* <li><Link to="/website/department-details-2">Dental</Link></li>
                  <li><Link to="/website/department-details-3">Gastroenterology</Link></li>
                  <li><Link to="/website/department-details-4">Neurology</Link></li>
                  <li><Link to="/website/department-details-5">Orthopaedics</Link></li>
                  <li><Link to="/website/department-details-6">Modern Laboratory</Link></li> */}
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 2 ? "open" : ""}`} onClick={() => toggleDropdown(2)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Pages */}
              <li className={`dropdown ${activeDropdown === 3 ? "current" : ""}`}>
                <Link to="/website">Pages</Link>
                <ul style={{ display: activeDropdown === 3 ? "block" : "none" }}>
                  <li><Link to="/website/doctors">Our Doctors</Link></li>
                  <li><Link to="/website/doctor-details">Doctor Details</Link></li>
                  <li><Link to="/website/portfolio">Portfolio One</Link></li>
                  {/* <li><Link to="/website/portfolio-2">Portfolio Two</Link></li> */}
                  <li><Link to="/website/pricing">Pricing</Link></li>
                  <li><Link to="/website/error">Page Not Found</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 3 ? "open" : ""}`} onClick={() => toggleDropdown(3)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Shop */}
              <li className={`dropdown ${activeDropdown === 4 ? "current" : ""}`}>
                <Link to="/website">Blog</Link>
                <ul style={{ display: activeDropdown === 4 ? "block" : "none" }}>
                  <li><Link to="/website/blog">Blog Grid</Link></li>
                  {/* <li><Link to="/website/blog-2">Blog Standard</Link></li> */}
                  <li><Link to="/website/blog-details">Blog Details</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 4 ? "open" : ""}`} onClick={() => toggleDropdown(4)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Contact */}
              <li><Link to="/website/contact">Contact</Link></li>

            </ul>
          </div>

          <div className="contact-info">
              <h4>Contact Info</h4>
              <ul>
                  <li>Chicago 12, Melborne City, USA</li>
                  <li><Link to="tel:+8801682648101">+88 01682648101</Link></li>
                  <li><Link to="mailto:info@example.com">info@example.com</Link></li>
              </ul>
          </div>

          {/* Social Links */}
          <div className="social-links">
            <ul className="clearfix">
              <li><Link to="/website"><span className="fab fa-twitter" /></Link></li>
              <li><Link to="/website"><span className="fab fa-facebook-square" /></Link></li>
              <li><Link to="/website"><span className="fab fa-pinterest-p" /></Link></li>
              <li><Link to="/website"><span className="fab fa-instagram" /></Link></li>
              <li><Link to="/website"><span className="fab fa-youtube" /></Link></li>
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
