
import Image from '@website/components/Image';
import { Link } from "react-router-dom"

export default function Footer1() {
    return (
        <>
            <footer className="main-footer">
                <div className="widget-section p_relative">
                    <div className="pattern-layer">
                        <div className="pattern-1" style={{ backgroundImage: "url(/website/assets/images/shape/shape-21.png)" }}></div>
                        <div className="pattern-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-22.png)" }}></div>
                        <div className="pattern-3" style={{ backgroundImage: "url(/website/assets/images/shape/shape-23.png)" }}></div>
                        <div className="pattern-4" style={{ backgroundImage: "url(/website/assets/images/shape/shape-24.png)" }}></div>
                    </div>
                    <div className="container-fluid res-container-px">
                        {/* Desktop Layout (Hidden on Mobile) */}
                        <div className="row clearfix d-none d-md-flex">
                            <div className="col-lg-2 footer-column">
                                <div className="footer-widget logo-widget">
                                    <div className="footer-logo">
                                        <Link to="/">
                                            <Image src="/miisky-logo.png" alt="Miisky Logo" width={180} height={40} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                             <div className="col-lg-4 footer-column">
                                <div className="footer-widget about-widget">
                                    <div className="widget-title">
                                        <h3>About Us</h3>
                                    </div>
                                    <div className="widget-content">
                                        <p>Simplifying health through innovative medical technology and accessible care for everyone.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-1 footer-column">
                                <div className="footer-widget links-widget">
                                    <div className="widget-title">
                                        <h3>Links</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="links-list clearfix">
                                            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About</Link></li>
                                            <li><Link to="/medical-devices" onClick={() => window.scrollTo(0, 0)}>Products</Link></li>
                                            <li><Link to="/gallery" onClick={() => window.scrollTo(0, 0)}>Our Gallery</Link></li>
                                            <li><Link to="/partners" onClick={() => window.scrollTo(0, 0)}>Our Partners</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-1 footer-column">
                                <div className="footer-widget links-widget">
                                    <div className="widget-title">
                                        <h3>Services</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="links-list clearfix">
                                            <li><Link to="/medical-devices" onClick={() => window.scrollTo(0, 0)}>Devices</Link></li>
                                            <li><Link to="/patents" onClick={() => window.scrollTo(0, 0)}>Patents</Link></li>
                                            <li><Link to="/careers" onClick={() => window.scrollTo(0, 0)}>Careers</Link></li>
                                            <li><Link to="/faq" onClick={() => window.scrollTo(0, 0)}>Support</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                             <div className="col-lg-4 footer-column">
                                <div className="footer-widget contact-widget">
                                    <div className="widget-title">
                                        <h3>Contacts</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="info-list clearfix">
                                            <li><Image src="/website/assets/images/icons/icon-5.svg" alt="Icon" width={20} height={15} priority />Email: <Link to="mailto:support@miisky.com">support@miisky.com</Link></li>
                                            <li><Image src="/website/assets/images/icons/icon-6.svg" alt="Icon" width={20} height={21} priority />Call : <Link to="tel:+919845497950">+91 9845497950</Link></li>
                                            <li><Image src="/website/assets/images/icons/icon-7.svg" alt="Icon" width={20} height={20} priority />#211, Rajarajeswarinagar, Bengaluru </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Design (Matching User Image) */}
                        <div className="mobile-footer-wrapper d-block d-md-none">
                            <div className="footer-logo centred">
                                <Link to="/">
                                    <Image src="/miisky-logo.png" alt="Miisky Logo" />
                                </Link>
                            </div>

                            <div className="footer-links-grid row">
                                <div className="col-6 mb_40">
                                    <h4 className="fs_15 fw_bold color_white text-uppercase">CONTACT US</h4>
                                    <ul className="mobile-contact-list fs_13 color_white">
                                        <li className="mb_15 opacity_80">#211, Rajarajeswarinagar,<br/>Bengaluru-560098</li>
                                        <li className="mb_5 fw_bold text-uppercase opacity_100">PHONE NO.</li>
                                        <li className="mb_15 opacity_80"><Link to="tel:+919845497950" className="color_white">+91 9845497950</Link></li>
                                        <li className="mb_5 fw_bold text-uppercase opacity_100">EMAIL</li>
                                        <li className="opacity_80"><Link to="mailto:support@miisky.com" className="color_white">support@miisky.com</Link></li>
                                    </ul>
                                </div>
                                <div className="col-6 mb_40">
                                    <h4 className="fs_15 fw_bold color_white text-uppercase">QUICK LINKS</h4>
                                    <ul className="mobile-quick-links fs_13 color_white opacity_80">
                                        <li><Link to="/about" className="color_white" onClick={() => window.scrollTo(0, 0)}>About</Link></li>
                                        <li><Link to="/medical-devices" className="color_white" onClick={() => window.scrollTo(0, 0)}>Products</Link></li>
                                        <li><Link to="/gallery" className="color_white" onClick={() => window.scrollTo(0, 0)}>Gallery</Link></li>
                                        <li><Link to="/partners" className="color_white" onClick={() => window.scrollTo(0, 0)}>Partners</Link></li>
                                        <li><Link to="/faq" className="color_white" onClick={() => window.scrollTo(0, 0)}>Support</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom centred">
                    <div className="container-fluid res-container-px p_relative">
                        <div className="copyright p_relative">
                            <p><span style={{ color: '#ffb129' }}>Miisky</span> &copy; {new Date().getFullYear()} All Right Reserved</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
