import { useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import ContactForm from "../components/elements/ContactForm";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import GoogleMapSection from "../components/sections/home1/GoogleMap";

export default function ContactPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Contact Us");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <div className="boxed_wrapper">
                <section className="contact-info-two centred">
                    <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-43.png)" }}></div>
                    <div className="auto-container">
                        <div className="row clearfix" style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms" style={{ height: '100%' }}>
                                    <div className="inner-box" style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', height: '100%', padding: '85px 30px 30px 30px' }}>
                                        <div className="icon-box"><Image src="/website/assets/images/icons/icon-23.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3>Office Location</h3>
                                        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>#211, Temple Street, 9th Main Road, BEML III Stage, Rajarajeswarinagar, Bengaluru, Karnataka 560098</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="200ms" data-wow-duration="1500ms" style={{ height: '100%' }}>
                                    <div className="inner-box" style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', height: '100%', padding: '85px 30px 30px 30px' }}>
                                        <div className="icon-box"><Image src="/website/assets/images/icons/icon-24.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3>Company Email</h3>
                                        <p style={{ fontSize: '14px' }}><Link to="mailto:support@miisky.com">support@miisky.com</Link><br /><Link to="mailto:g.jagan@aarmsvaluechain.com">g.jagan@aarmsvaluechain.com</Link></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="400ms" data-wow-duration="1500ms" style={{ height: '100%' }}>
                                    <div className="inner-box" style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', height: '100%', padding: '85px 30px 30px 30px' }}>
                                        <div className="icon-box"><Image src="/website/assets/images/icons/icon-25.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3>Contact Us</h3>
                                        <p style={{ fontSize: '14px' }}><Link to="tel:+919845497950">+91 9845497950</Link></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms" style={{ height: '100%' }}>
                                    <div className="inner-box" style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', height: '100%', padding: '85px 30px 30px 30px' }}>
                                        <div className="icon-box" style={{ backgroundColor: '#0646ac', borderRadius: '18px', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '-50px' }}>
                                            <Clock size={40} color="#fff" />
                                        </div>
                                        <h3>Working Hours</h3>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: '#666' }}>
                                            <li style={{ marginBottom: '5px' }}>Mon - Fri: 9:30AM - 6:00PM</li>
                                            <li style={{ marginBottom: '5px' }}>Sat: 9:30AM - 2:30PM</li>
                                            <li>Sun: Closed</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="contact-section sec-pad">
                    <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-42.png)" }}></div>
                    <div className="auto-container">
                        <div className="inner-box">
                            <h2>Leave a Comment</h2>
                            <ContactForm />
                        </div>
                    </div>
                </section>
                <section className="google-map-section" style={{ padding: 0 }}>
                    <GoogleMapSection />
                </section>
        </div>
    );
}
