import { useState } from "react";
import ModalVideo from "../components/elements/VideoPopup";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Video from "../components/sections/home3/Video";
import Cta from "../components/sections/home2/Cta";
export default function Departments_Page() {

    const [activeTab, setActiveTab] = useState(1);

    const tabs = [
        { id: 1, title: "Modern Technology" },
        { id: 2, title: "Success of Treatments" },
        { id: 3, title: "Certified Doctors" },
    ];

    const tabContent = [
        {
        id: 1,
        videoImg: "/website/assets/images/resource/video-1.jpg",
        heading: "Modern Technology",
        text: "The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.",
        list: [
            "Your Health is Our Top Priority",
            "Compassionate Care, Innovative Treatments",
            "We Treat You Like Family",
            "Leading the Way in Medical Excellence",
        ],
        },
        {
        id: 2,
        videoImg: "/website/assets/images/resource/video-1.jpg",
        heading: "Success of Treatments",
        text: "The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.",
        list: [
            "Your Health is Our Top Priority",
            "Compassionate Care, Innovative Treatments",
            "We Treat You Like Family",
            "Leading the Way in Medical Excellence",
        ],
        },
        {
        id: 3,
        videoImg: "/website/assets/images/resource/video-1.jpg",
        heading: "Certified Doctors",
        text: "The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.",
        list: [
            "Your Health is Our Top Priority",
            "Compassionate Care, Innovative Treatments",
            "We Treat You Like Family",
            "Leading the Way in Medical Excellence",
        ],
        },
    ];

    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Our Departments">
                <section className="service-page-section p_relative">
                    <div className="auto-container">
                        <div className="row clearfix">
                             <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                                <div className="service-block-one">
                                    <div className="inner-box">
                                        <figure className="image-box"><Image src="/website/assets/images/service/service-1.jpg" alt="Image" width={416} height={358} priority /></figure>
                                        <div className="lower-content">
                                            <div className="inner">
                                                <div className="icon-box"><i className="icon-18"></i></div>
                                                <h3><Link to="/website/department-details">Cardiology</Link></h3>
                                                <p>Cardiologists are healthcare professionals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                                <div className="service-block-one">
                                    <div className="inner-box">
                                        <figure className="image-box"><Image src="/website/assets/images/service/service-2.jpg" alt="Image" width={416} height={358} priority /></figure>
                                        <div className="lower-content">
                                            <div className="inner">
                                                <div className="icon-box"><i className="icon-19"></i></div>
                                                <h3><Link to="/website/department-details-2">Dental</Link></h3>
                                                <p>Cardiologists are healthcare professionals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                                <div className="service-block-one">
                                    <div className="inner-box">
                                        <figure className="image-box"><Image src="/website/assets/images/service/service-3.jpg" alt="Image" width={416} height={358} priority /></figure>
                                        <div className="lower-content">
                                            <div className="inner">
                                                <div className="icon-box"><i className="icon-20"></i></div>
                                                <h3><Link to="/website/department-details-3">Gastroenterology</Link></h3>
                                                <p>Cardiologists are healthcare professionals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                                <div className="service-block-one">
                                    <div className="inner-box">
                                        <figure className="image-box"><Image src="/website/assets/images/service/service-1.jpg" alt="Image" width={416} height={358} priority /></figure>
                                        <div className="lower-content">
                                            <div className="inner">
                                                <div className="icon-box"><i className="icon-28"></i></div>
                                                <h3><Link to="/website/department-details-4">Neurology</Link></h3>
                                                <p>Cardiologists are healthcare professionals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                                <div className="service-block-one">
                                    <div className="inner-box">
                                        <figure className="image-box"><Image src="/website/assets/images/service/service-2.jpg" alt="Image" width={416} height={358} priority /></figure>
                                        <div className="lower-content">
                                            <div className="inner">
                                                <div className="icon-box"><i className="icon-29"></i></div>
                                                <h3><Link to="/website/department-details-5">Orthopaedics</Link></h3>
                                                <p>Cardiologists are healthcare professionals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                                <div className="service-block-one">
                                    <div className="inner-box">
                                        <figure className="image-box"><Image src="/website/assets/images/service/service-3.jpg" alt="Image" width={416} height={358} priority /></figure>
                                        <div className="lower-content">
                                            <div className="inner">
                                                <div className="icon-box"><i className="icon-37"></i></div>
                                                <h3><Link to="/website/department-details-6">Dental Caring</Link></h3>
                                                <p>Cardiologists are healthcare professionals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Video/>

                <section className="chooseus-section service-page sec-pad p_relative">

                    <div className="auto-container">
                        <div className="sec-title centred mb_55">
                        <span className="sub-title mb_5">Why Choose Us</span>
                        <h2>What&apos;s Our Speciality</h2>
                        <p>
                            Medical care is the practice of providing diagnosis, treatment, and
                            preventive care for various <br /> illnesses, injuries, and diseases. It
                        </p>
                        </div>

                        {/* Tabs Buttons */}
                        <div className="tabs-box">
                        <div className="tab-btns tab-buttons clearfix centred mb_40">
                            {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? "active-btn" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <h3>{tab.title}</h3>
                            </button>
                            ))}
                        </div>

                        {/* Tabs Content */}
                        <div className="tabs-content">
                            {tabContent.map((content) => (
                            <div
                                key={content.id}
                                className={`tab ${activeTab === content.id ? "active-tab" : ""}`}
                            >
                                <div className="inner-box">
                                <div
                                    className="shape"
                                    style={{ backgroundImage: "url(/website/assets/images/shape/shape-14.png)" }}
                                ></div>
                                <div className="row clearfix">
                                    <div className="col-lg-6 col-md-12 col-sm-12 video-column">
                                    <div
                                        className="video-inner"
                                        style={{ backgroundImage: `url(${content.videoImg})` }}
                                    >
                                        <div className="video-btn">
                                        <ModalVideo />
                                        </div>
                                    </div>
                                    </div>
                                    <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                                    <div className="content-block-two">
                                        <div className="content-box ml_40">
                                        <div className="text-box">
                                            <h3>{content.heading}</h3>
                                            <p>{content.text}</p>
                                        </div>
                                        <ul className="list-style-one clearfix">
                                            {content.list.map((item, index) => (
                                            <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                        <div className="btn-box">
                                            <Link to="/website/departments" className="theme-btn btn-two">
                                            <span>See All Services</span>
                                            </Link>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                </section>

                <section className="appointment-style-two p_relative">
                    <div className="auto-container">
                        <div className="inner-box">
                            <h2>Make an Appointment</h2>
                            <form method="post" action="/website" className="default-form">
                                <div className="row clearfix">
                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><i className="icon-45"></i></div>
                                            <input type="text" name="name" placeholder="Name" required/>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><i className="icon-46"></i></div>
                                            <input type="email" name="email" placeholder="Email" required/>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><Image src="/website/assets/images/icons/icon-18.svg" alt="Image" width={14} height={15} priority /></div>
                                            <input type="text" name="phone" placeholder="Phone" required/>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><i className="icon-48"></i></div>
                                            <textarea name="message" placeholder="Message"></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                                        <div className="form-group message-btn">
                                            <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
                <Cta/>
            </Layout>
        </div>
    )
}
