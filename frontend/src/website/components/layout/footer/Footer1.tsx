
import Image from "../../Image";
import { Link } from "react-router-dom"

export default function Footer1() {
    return (
        <>
        
            <footer className="main-footer">
                <div className="widget-section p_relative">
                    <div className="pattern-layer">
                        <div className="pattern-1" style={{ backgroundImage: "url(/website/assets/images/shape/shape-21.png)" }}></div>
                        <div className="pattern-2"  style={{ backgroundImage: "url(/website/assets/images/shape/shape-22.png)" }}></div>
                        <div className="pattern-3"  style={{ backgroundImage: "url(/website/assets/images/shape/shape-23.png)" }}></div>
                        <div className="pattern-4"  style={{ backgroundImage: "url(/website/assets/images/shape/shape-24.png)" }}></div>
                    </div>
                    <div className="container-fluid px-10">
                        <div className="row clearfix">
                            <div className="col-lg-2 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget logo-widget">
                                    <div className="footer-logo">
                                        <Link to="/">
                                            <Image src="/miisky-logo.png" alt="Miisky Logo" width={180} height={40} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget about-widget">
                                    <div className="widget-title">
                                        <h3>About Us</h3>
                                    </div>
                                    <div className="widget-content">
                                        <p>Simplifying health through innovative medical technology and accessible care for everyone.</p>
                                        <ul className="social-links clearfix">
                                            <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                            <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                            <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-1 col-md-6 col-sm-12 footer-column">
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
                            <div className="col-lg-1 col-md-6 col-sm-12 footer-column">
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
                            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget contact-widget">
                                    <div className="widget-title">
                                        <h3>Contacts</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="info-list clearfix">
                                            <li><Image src="/website/assets/images/icons/icon-5.svg" alt="Icon" width={20} height={15} priority />Email: <Link to="mailto:support@miisky.com">support@miisky.com</Link></li>
                                            <li><Image src="/website/assets/images/icons/icon-6.svg" alt="Icon" width={20} height={21} priority />Call : <Link to="tel:+919845497950">+91 9845497950</Link></li>
                                            <li><Image src="/website/assets/images/icons/icon-7.svg" alt="Icon" width={20} height={20} priority />#211, Rajarajeswarinagar, Bengaluru-560098 </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-2 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget contact-widget">
                                    <div className="widget-title">
                                        <h3>Working Hours</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="info-list clearfix">
                                            <li style={{ whiteSpace: 'nowrap', fontSize: '15px' }}>Mon - Fri: 9:30AM - 6:00PM</li>
                                            <li style={{ whiteSpace: 'nowrap', fontSize: '15px' }}>Sat: 9:30AM - 2:30PM</li>
                                            <li style={{ whiteSpace: 'nowrap', fontSize: '15px' }}>Sun: Closed</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="footer-bottom centred">
                    <div className="container-fluid px-10">
                        <div className="copyright">
                            <p><Link to="/" onClick={() => window.scrollTo(0, 0)}>Miisky</Link> &copy; {new Date().getFullYear()} All Right Reserved</p>
                        </div>
                    </div>
                </div>
            </footer>

        </>
    )
}
