import React from "react";
import { Link } from "react-router-dom";

type SidebarPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SidebarPopup: React.FC<SidebarPopupProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`xs-sidebar-group info-group ${isOpen ? "active" : ""}`}>
      {/* Overlay */}

      {/* Sidebar Content */}
      <div className="xs-sidebar-widget">
        <div className="sidebar-widget-container">
          <div className="widget-heading">
            <button
              onClick={onClose}
              className="close-side-widget"
            >
              <i className="far fa-times"></i>
            </button>
          </div>

          <div className="sidebar-textwidget">
            <div className="sidebar-info-contents">
              <div className="content-inner">
                {/* Logo */}
                <div className="logo">
                  <Link to="/website">
                    <img src="/website/assets/images/logo.png" alt="Logo" />
                  </Link>
                </div>

                {/* About Section */}
                <div className="content-box">
                  <h4>About Us</h4>
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium.
                  </p>
                  <Link to="/website/about" className="theme-btn btn-one">
                    <span>About Us</span>
                  </Link>
                </div>

                {/* Contact Info */}
                <div className="contact-info">
                  <h4>Contact Info</h4>
                  <ul>
                    <li>Chicago 12, Melborne City, USA</li>
                    <li>
                      <Link to="tel:+8801682648101">+88 01682648101</Link>
                    </li>
                    <li>
                      <Link to="mailto:info@example.com">info@example.com</Link>
                    </li>
                  </ul>
                </div>

                {/* Social Links */}
                <ul className="social-box flex gap-4">
                  <li>
                    <Link to="#">
                      <i className="icon-4"></i>
                    </Link>
                  </li>
                  <li>
                    <Link to="#">
                      <i className="icon-5"></i>
                    </Link>
                  </li>
                  <li>
                    <Link to="#">
                      <i className="icon-6"></i>
                    </Link>
                  </li>
                  <li>
                    <Link to="#">
                      <i className="icon-7"></i>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarPopup;
