import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Image from "../Image";
import { getDepartments } from "../../../utils/api";

type MobileMenuProps = {
  isSidebar: boolean;
  handleMobileMenu: () => void;
  handleSidebar: () => void;
};

export default function MobileMenu({ isSidebar, handleMobileMenu, handleSidebar }: MobileMenuProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
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
        console.error("Failed to fetch departments for mobile menu:", err);
        setDepartments([]);
      }
    };
    fetchDepartmentsData();
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

              {/* About */}
              <li><Link to="/about">About Us</Link></li>

              {/* Departments */}
              <li className={`dropdown ${activeDropdown === 1 ? "active" : ""}`}>
                <Link to="/departments">Departments</Link>
                <ul className="sub-menu">
                  <li><Link to="/departments">Our Departments</Link></li>
                  {departments.map((dept: any) => (
                    <li key={dept.id}>
                      <Link to={`/department-details/${dept.id}`}>{dept.name}</Link>
                    </li>
                  ))}
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 1 ? "open" : ""}`} onClick={() => toggleDropdown(1)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Products */}
              <li className={`dropdown ${activeDropdown === 2 ? "active" : ""}`}>
                <Link to="/device-categories">Products</Link>
                <ul className="sub-menu">
                  <li><Link to="/device-categories">Device Categories</Link></li>
                  <li><Link to="/medical-devices">Medical Devices</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 2 ? "open" : ""}`} onClick={() => toggleDropdown(2)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Innovation */}
              <li className={`dropdown ${activeDropdown === 3 ? "active" : ""}`}>
                <Link to="/research">Innovation</Link>
                <ul className="sub-menu">
                  <li><Link to="/research">Research Papers</Link></li>
                  <li><Link to="/patents">Patents</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 3 ? "open" : ""}`} onClick={() => toggleDropdown(3)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Support */}
              <li className={`dropdown ${activeDropdown === 4 ? "active" : ""}`}>
                <Link to="/">Support</Link>
                <ul className="sub-menu">
                  <li><Link to="/doctors">Our Doctors</Link></li>
                  <li><Link to="/careers">Careers</Link></li>
                  <li><Link to="/faq">FAQ</Link></li>
                  <li><Link to="/gallery">Gallery</Link></li>
                  <li><Link to="/partners">Our Partners</Link></li>
                  <li><Link to="/plans">Plans</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 4 ? "open" : ""}`} onClick={() => toggleDropdown(4)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Blog */}
              <li className={`dropdown ${activeDropdown === 5 ? "active" : ""}`}>
                <Link to="/blog">Blog</Link>
                <ul className="sub-menu">
                  <li><Link to="/blog">Blog Grid</Link></li>
                </ul>
                <div className={`dropdown-btn ${activeDropdown === 5 ? "open" : ""}`} onClick={() => toggleDropdown(5)}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              {/* Contact */}
              <li><Link to="/contact">Contact</Link></li>

              {/* Login */}
              <li style={{ padding: '15px 25px 0 25px' }}>
                <Link to="/signin" className="theme-btn btn-one" style={{ 
                  width: '100%', 
                  padding: '10px 0', 
                  borderRadius: '5px',
                  fontSize: '14px',
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
