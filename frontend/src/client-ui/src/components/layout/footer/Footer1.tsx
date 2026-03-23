
import Image from "@/components/Image";
import { Link } from "react-router-dom"

export default function Footer1() {
    return (
        <>
        
            <footer className="main-footer">
                <div className="widget-section p_relative">
                    <div className="pattern-layer">
                        <div className="pattern-1" style={{ backgroundImage: "url(assets/images/shape/shape-21.png)" }}></div>
                        <div className="pattern-2"  style={{ backgroundImage: "url(assets/images/shape/shape-22.png)" }}></div>
                        <div className="pattern-3"  style={{ backgroundImage: "url(assets/images/shape/shape-23.png)" }}></div>
                        <div className="pattern-4"  style={{ backgroundImage: "url(assets/images/shape/shape-24.png)" }}></div>
                    </div>
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget about-widget">
                                    <div className="widget-title">
                                        <h3>About Us</h3>
                                    </div>
                                    <div className="widget-content">
                                        <p>To provide accessible and equitable healthcare for all individuals, regardless of their  or socioeconomic status.</p>
                                        <ul className="social-links clearfix">
                                            <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                            <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                            <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget links-widget ml_70">
                                    <div className="widget-title">
                                        <h3>Links</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="links-list clearfix">
                                            <li><Link to="/about">About</Link></li>
                                            <li><Link to="/">Surgery</Link></li>
                                            <li><Link to="/">Medications</Link></li>
                                            <li><Link to="/">Chemotherapy</Link></li>
                                            <li><Link to="/">Physical therapy</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget links-widget ml_70">
                                    <div className="widget-title">
                                        <h3>Services</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="links-list clearfix">
                                            <li><Link to="/">Primary care</Link></li>
                                            <li><Link to="/">Specialty care</Link></li>
                                            <li><Link to="/">Emergency care</Link></li>
                                            <li><Link to="/">Diagnostic services</Link></li>
                                            <li><Link to="/">Rehabilitation services</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget contact-widget">
                                    <div className="widget-title">
                                        <h3>Contacts</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="info-list clearfix">
                                            <li><Image src="/assets/images/icons/icon-5.svg" alt="Icon" width={20} height={15} priority />Email: <Link to="mailto:info@yourmail.com">info@yourmail.com</Link></li>
                                            <li><Image src="/assets/images/icons/icon-6.svg" alt="Icon" width={20} height={21} priority />Call : <Link to="tel:123045615523">+1 (230)-456-155-23</Link></li>
                                            <li><Image src="/assets/images/icons/icon-7.svg" alt="Icon" width={20} height={20} priority />2972 Westheimer Rd. Santa Ana, Illinois 85486 </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer-menu mt_60">
                            <figure className="logo-box"><Link to="/"><Image src="/assets/images/logo.png" alt="Footer Logo" width={203} height={40} priority /></Link></figure>
                            <ul className="menu-list clearfix">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/service">Departments</Link></li>
                                <li><Link to="/portfolio">Portfolio</Link></li>
                                <li><Link to="/blog">Blog</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom centred">
                    <div className="auto-container">
                        <div className="copyright">
                            <p><Link to="/">Medicinsk</Link> &copy; {new Date().getFullYear()} All Right Reserved</p>
                        </div>
                    </div>
                </div>
            </footer>

        </>
    )
}
