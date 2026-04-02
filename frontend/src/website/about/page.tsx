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
        about_title: "Expertise and compassion saved my life",
        about_description: "The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me",
        about_specialties: ["Preventive care", "Diagnostic testing", "Mental health services"],
        about_vision: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"],
        about_experience_years: 30,
        about_experience_text: "Years of Experience in This Field",
        about_image_1_url: "/website/assets/images/background/company.jpg"
    };

    return (
        <div className="boxed_wrapper">
                <section className="about-section about-page p_relative pb_50">
                    <div className="auto-container">
                        <div className="upper-content mb_80">
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
