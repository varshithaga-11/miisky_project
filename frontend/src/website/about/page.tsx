import { useState, useEffect } from "react";
// import CountUp from "react-countup";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Working from "../components/sections/home2/Working";
import Clients from "../components/sections/home3/Clients";
import Team from "../components/sections/home1/Team";
import Cta from "../components/sections/home2/Cta";
import { getDepartments, getAboutSections } from "../../utils/api";
import { MOCK_DEPARTMENTS } from "../../Website/utils/mockData";
import { getDepartmentIcon } from "../../utils/departmentIcons";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 1,
    spaceBetween: 30,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    loop: true,
    pagination: {
        clickable: true,
    },
    breakpoints: {
        320:  { slidesPerView: 1 },
        575:  { slidesPerView: 1 },
        767:  { slidesPerView: 2 },
        991:  { slidesPerView: 3 },
        1200: { slidesPerView: 3 },
    },
};

export default function About_Page() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
    const [loading, setLoading] = useState(true);
    const [aboutConfig, setAboutConfig] = useState<any>(null);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("About Us");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Departments
                const deptRes = await getDepartments();
                const deptItems = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data.results || [];
                setDepartments(deptItems.length > 0 ? deptItems : MOCK_DEPARTMENTS);

                // Fetch About Config
                const aboutRes = await getAboutSections() as any;
                const configItems = aboutRes.data?.results || [];
                if (configItems.length > 0) {
                    setAboutConfig(configItems[0]);
                }
            } catch (err) {
                console.warn('Failed to fetch dynamic content:', err);
                setDepartments(MOCK_DEPARTMENTS);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Placeholder data for "First Glance" if no config is in DB
    const displayConfig = aboutConfig || {
        about_tagline: "About the company",
        about_title: "Futuristic Healthcare Innovation",
        about_description: "Miisky is a technology-driven innovation startup focused on creating an ecosystem for healthcare, emphasizing continuous monitoring and affordability. Our mission is to revolutionize patient care through cutting-edge medical technology and accessible health solutions.",
        about_specialties: ["NIR Technology", "Continuous Monitoring", "Affordable Healthcare"],
        about_vision: ["To provide accessible healthcare for all", "To pioneer NIR-based medical devices", "To empower patients with continuous data"],
        about_experience_years: 5,
        about_experience_text: "Years of Research & Innovation",
        about_image_1_url: "/website/assets/images/background/company.jpg"
    };

    return (
        <div className="boxed_wrapper">
                <section className="about-section about-page p_relative pb_50">
                    <div className="auto-container">
                        <div className="upper-content mb_50">
                            <div className="row clearfix">
                                <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                                    <div className="content-block-one">
                                        <div className="content-box">
                                            <div className="sec-title mb_15">
                                                <span className="sub-title mb_5">{displayConfig.about_tagline}</span>
                                                <h2>{displayConfig.about_title}</h2>
                                            </div>
                                            <div className="text-box mb_30 pb_30">
                                                <p>{displayConfig.about_description}</p>
                                            </div>
                                            <div className="inner-box">
                                                <div className="row clearfix">
                                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                        <div className="specialities-box">
                                                            <h4>Our Specialities</h4>
                                                            <ul className="list-style-one clearfix">
                                                                {displayConfig.about_specialties?.map((item: any, i: number) => <li key={i}>{item}</li>)}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                        <div className="specialities-box">
                                                            <h4>Our Vision</h4>
                                                            <ul className="list-style-one clearfix">
                                                                {displayConfig.about_vision?.map((item: any, i: number) => <li key={i}>{item}</li>)}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                                    <div className="image-block-one">
                                        <div className="image-box">
                                            <div className="shape">
                                                <div className="shape-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-10.png)" }}></div>
                                            </div>
                                            <figure className="image">
                                                <Image src={displayConfig.about_image_1_url || "/website/assets/images/background/company.jpg"} alt="Company Overview" width={523} height={399} priority />
                                            </figure>
                                            <div className="text-box">
                                                <div className="image-shape" style={{ backgroundImage: "url(/website/assets/images/shape/shape-7.png)" }}></div>
                                                <h2>{displayConfig.about_experience_years}</h2>
                                                <span>{displayConfig.about_experience_text}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="innovation-section p_relative pb_100 pt_50">
                    <div className="auto-container">
                        <div className="sec-title mb_50 centred">
                            <span className="sub-title mb_5">Our Innovation Journey</span>
                            <h2>Research & Collaboration <br />at Miisky</h2>
                        </div>
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <div className="inner-box p_relative d_block bg-white p_50 shadow-sm" style={{ borderRadius: '30px', border: '1px solid #f0f0f0', backgroundColor: '#ffffff' }}>
                                    <div className="row clearfix align-items-center">
                                        <div className="col-lg-4 col-md-12 col-sm-12 mb-4 mb-lg-0">
                                            <div className="image-box text-center p_relative">
                                                <i className="fas fa-microscope" style={{ fontSize: '150px', color: '#0646ac', opacity: 0.05, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }}></i>
                                                <h3 style={{ fontWeight: 800, color: '#0646ac', position: 'relative', zIndex: 1, fontSize: '32px' }}>BEES LAB <br />IISC Bangalore</h3>
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

                <section className="vision-section p_relative pb_100 pt_50" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12 col-sm-12 content-column">
                                <div className="sec-title mb_50 centred">
                                    <span className="sub-title mb_5">Our Vision & Mission</span>
                                    <h2>Pioneering the Future of <br />Predictive Health</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row clearfix">
                            <div className="col-lg-4 col-md-6 col-sm-12 single-column">
                                <div className="vision-block-one p_40 bg-white shadow-sm mb_30 h-100" style={{ borderRadius: '25px', border: '1px solid #f0f0f0' }}>
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
                                <div className="vision-block-one p_40 bg-white shadow-sm mb_30 h-100" style={{ borderRadius: '25px', border: '1px solid #f0f0f0' }}>
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
                                <div className="vision-block-one p_40 bg-white shadow-sm mb_30 h-100" style={{ borderRadius: '25px', border: '1px solid #f0f0f0' }}>
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

                <section className="service-section about-page p_relative">
                    <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-13.png)" }}></div>
                    <div className="auto-container">
                        <div className="sec-title mb_60 centred">
                            <span className="sub-title mb_5">What we do for our patients</span>
                            <h2>Our Medical Departments <br />Services</h2>
                            <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />illnesses, injuries, and diseases. It</p>
                        </div>
                        <div className="row clearfix">
                            {loading ? (
                                <div style={{padding: '40px', textAlign: 'center', width: '100%'}}>Loading departments...</div>
                            ) : (
                                <Swiper {...swiperOptions} className="three-item-carousel owl-theme nav-style-one">
                                    {departments.map((dept: any) => (
                                        <SwiperSlide key={dept.id}>
                                            <div className="service-block-one">
                                                <div className="inner-box">
                                                    <figure className="image-box"><Image src={dept.image || "/website/assets/images/service/service-1.jpg"} alt={dept.name} width={416} height={358} priority /></figure>
                                                    <div className="lower-content">
                                                        <div className="inner">
                                                            <div className="icon-box">
                                                                <img
                                                                    src={getDepartmentIcon(dept.icon_class || dept.icon || "").src}
                                                                    alt={dept.name}
                                                                    style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                                                                />
                                                            </div>
                                                            <h3><Link to="/departments">{dept.name}</Link></h3>
                                                            <p>{dept.description || "Professional healthcare services for your well-being."}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}
                        </div>
                    </div>
                </section>
                <Working/>
                <Clients/>
                <Team/>
                <Cta/>
        </div>
    );
}
