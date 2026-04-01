
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
                    <div className="auto-container">
                        <div className="row clearfix">
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
                            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                                <div className="footer-widget links-widget ml_70">
                                    <div className="widget-title">
                                        <h3>Links</h3>
                                    </div>
                                    <div className="widget-content">
                                        <ul className="links-list clearfix">
                                            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About</Link></li>
                                            <li><Link to="/medical-devices" onClick={() => window.scrollTo(0, 0)}>Products</Link></li>
                                            <li><Link to="/research" onClick={() => window.scrollTo(0, 0)}>Innovation</Link></li>
                                            <li><Link to="/gallery" onClick={() => window.scrollTo(0, 0)}>Our Gallery</Link></li>
                                            <li><Link to="/partners" onClick={() => window.scrollTo(0, 0)}>Our Partners</Link></li>
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
                                            <li><Link to="/medical-devices" onClick={() => window.scrollTo(0, 0)}>Medical Devices</Link></li>
                                            <li><Link to="/research" onClick={() => window.scrollTo(0, 0)}>Research Papers</Link></li>
                                            <li><Link to="/patents" onClick={() => window.scrollTo(0, 0)}>Patents</Link></li>
                                            <li><Link to="/careers" onClick={() => window.scrollTo(0, 0)}>Careers</Link></li>
                                            <li><Link to="/faq" onClick={() => window.scrollTo(0, 0)}>FAQ Support</Link></li>
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
                                            <li><Image src="/website/assets/images/icons/icon-7.svg" alt="Icon" width={20} height={20} priority />#211, Temple Street, 9th Main Road, BEML III Stage, Rajarajeswarinagar, Bengaluru - 560098 </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="footer-bottom centred">
                    <div className="auto-container">
                        <div className="copyright">
                            <p><Link to="/" onClick={() => window.scrollTo(0, 0)}>Miisky</Link> &copy; {new Date().getFullYear()} All Right Reserved</p>
                        </div>
                    </div>
                </div>
            </footer>

        </>
    )
}
