import Layout from "../../../components/layout/Layout";
import ContactForm from "../../../components/elements/ContactForm";
import Image from "@/components/Image";
import { Link } from "react-router-dom";
import GoogleMapSection from "../../../components/sections/home1/GoogleMap";
export default function ContactPage() {

    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Contact Us">
                <section className="contact-info-two centred">
                    <div className="pattern-layer" style={{ backgroundImage: "url(assets/images/shape/shape-43.png)" }}></div>
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-4 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <div className="icon-box"><Image src="/assets/images/icons/icon-23.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3>Office Location</h3>
                                        <p>2972 Westheimer Rd. Santa Ana, Illinois 85486</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="300ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <div className="icon-box"><Image src="/assets/images/icons/icon-24.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3>Company Email</h3>
                                        <p><Link to="mailto:info@example.com">info@example.com</Link><br /><Link to="mailto:contact@example.com">contact@example.com</Link></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <div className="icon-box"><Image src="/assets/images/icons/icon-25.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3>Contact Us</h3>
                                        <p><Link to="tel:000111555999">+000 111555999</Link><br /><Link to="tel:000111555888">+000 111555888</Link></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="contact-section sec-pad">
                    <div className="pattern-layer" style={{ backgroundImage: "url(assets/images/shape/shape-42.png)" }}></div>
                    <div className="auto-container">
                        <div className="inner-box">
                            <h2>Leave a Comment</h2>
                            <ContactForm />
                        </div>
                    </div>
                </section>
                <GoogleMapSection />
            </Layout>
        </div>
    )
}
