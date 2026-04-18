import { useEffect } from "react";
// import CountUp from "react-countup";
import Image from '@website/components/Image';
import { Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import About from "../components/sections/home1/About";
import Working from "../components/sections/home1/Working";
import Clients from "../components/sections/home3/Clients";
import Team from "../components/sections/home1/Team";
import Service from "../components/sections/home1/Service";
import Cta from '@website/components/sections/home2/Cta';

export default function About_Page() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("About Us");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <div className="boxed_wrapper">
                <About/>
                <section className="innovation-section p_relative pb_100 pt_100">
                    <div className="auto-container">
                        <div className="sec-title mb_60 centred">
                            <span className="sub-title mb_5">Our Innovation Journey</span>
                            <h2>Research & Collaboration <br />at Miisky</h2>
                        </div>
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <div className="innovation-card inner-box p_relative d_block bg-white shadow-sm" style={{ borderRadius: '30px', border: '1px solid #f0f0f0', backgroundColor: '#ffffff' }}>
                                    <div className="row clearfix align-items-center">
                                        <div className="col-lg-4 col-md-12 col-sm-12 mb-4 mb-lg-0">
                                            <div className="image-box text-center p_relative">
                                                <i className="fas fa-microscope innovation-icon" style={{ color: '#0646ac', opacity: 0.05, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }}></i>
                                                <h3 className="innovation-lab-title" style={{ fontWeight: 800, color: '#0646ac', position: 'relative', zIndex: 1 }}>BEES LAB <br />IISC Bangalore</h3>
                                                <p style={{ fontWeight: 700, color: '#111827', position: 'relative', zIndex: 1, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Collaborative Research Partner</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-8 col-md-12 col-sm-12">
                                            <div className="text-content">
                                                <p className="mb_20" style={{ fontSize: '18px', lineHeight: '1.8', color: '#4b5563' }}>
                                                    <strong>Miisky</strong> is a futuristic technology-driven innovation startup focused on creating an <strong>Ecosystem for Healthcare</strong>, emphasizing <strong>Continuous monitoring</strong> and <strong>affordable price</strong>.
                                                </p>
                                                <p className="mb_20" style={{ fontSize: '18px', lineHeight: '1.8', color: '#4b5563' }}>
                                                    In collaboration with the <strong>Biomedical and Electronic Engineering Systems Laboratory (BEES LAB)</strong> of <strong>IISC Bangalore</strong>, we have developed medical devices based on <strong>NIR technology</strong>.
                                                </p>
                                                <div className="row clearfix mt_30">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="device-info p_30" style={{ backgroundColor: '#f8fbff', borderRadius: '25px', height: '100%', border: '1px solid #e1e9f5' }}>
                                                            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0646ac', marginBottom: '12px' }}><i className="fas fa-lungs mr-10"></i> NIR Ventilator</h4>
                                                            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>Life-saving ventilation support designed for the <strong>Golden Hour</strong> and <strong>COPD</strong> emergencies.</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <div className="device-info p_30" style={{ backgroundColor: '#f8fbff', borderRadius: '25px', height: '100%', border: '1px solid #e1e9f5' }}>
                                                            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0646ac', marginBottom: '12px' }}><i className="fas fa-virus mr-10"></i> NIR Viral Scanner</h4>
                                                            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>Capable of detecting and monitoring infectious <strong>Viral & Bacterial Diseases</strong> to aid in research and monitor <strong>Viral Loads</strong>.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="vision-section p_relative pb_100 pt_100" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12 col-sm-12 content-column">
                                <div className="sec-title mb_60 centred">
                                    <span className="sub-title mb_5">Our Vision & Mission</span>
                                    <h2>Pioneering the Future of <br />Predictive Health</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row clearfix">
                            <div className="col-lg-4 col-md-6 col-sm-12 single-column">
                                <div className="vision-block-one bg-white shadow-sm mb_30 h-100" style={{ borderRadius: '25px', border: '1px solid #f0f0f0' }}>
                                    <div className="icon-box mb_25" style={{ fontSize: '40px', color: '#0646ac' }}>
                                        <i className="fas fa-lightbulb"></i>
                                    </div>
                                    <h4 className="mb_15" style={{ fontWeight: 800 }}>Innovation First</h4>
                                    <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                        Our vision is to innovate & develop advanced medical devices, health & wellness solutions leveraging <strong>Internet of Things</strong>, <strong>Machine Learning</strong>, and <strong>Bio-Medical Engineering</strong> for preventive & predictable health values.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 single-column">
                                <div className="vision-block-one bg-white shadow-sm mb_30 h-100" style={{ borderRadius: '25px', border: '1px solid #f0f0f0' }}>
                                    <div className="icon-box mb_25" style={{ fontSize: '40px', color: '#0646ac' }}>
                                        <i className="fas fa-heartbeat"></i>
                                    </div>
                                    <h4 className="mb_15" style={{ fontWeight: 800 }}>Continuous Care</h4>
                                    <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                        Focus on developing <strong>non-invasive</strong>, affordable & continuous monitoring devices tracking vital parameters like <strong>Diabetes, Heart Rate, SPO2, Hemoglobin, Blood Pressure</strong>, and cardiology metrics.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 single-column">
                                <div className="vision-block-one bg-white shadow-sm mb_30 h-100" style={{ borderRadius: '25px', border: '1px solid #f0f0f0' }}>
                                    <div className="icon-box mb_25" style={{ fontSize: '40px', color: '#0646ac' }}>
                                        <i className="fas fa-network-wired"></i>
                                    </div>
                                    <h4 className="mb_15" style={{ fontWeight: 800 }}>Ecosystem Approach</h4>
                                    <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                        We foster an ecosystem approach by integrating patients with <strong>Doctors, Nutritionists, Dietitians</strong>, and Health experts to provide holistic health solutions and natural remedies. <strong>Innovation in ventilators</strong> by remote monitoring and control is focused to save lives.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Service/>
                <Working/>
                <Clients/>
                <Team/>
                <Cta/>
        </div>
    );
}
