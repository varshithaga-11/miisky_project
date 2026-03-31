import { useState, useEffect } from "react";
import CountUp from "react-countup";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Working from "../components/sections/home2/Working";
import Clients from "../components/sections/home3/Clients";
import Team from "../components/sections/home1/Team";
import Cta from "../components/sections/home2/Cta";
import { getDepartments } from "../../utils/api";
import { MOCK_DEPARTMENTS } from "../../Website/utils/mockData";

export default function About_Page() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("About Us");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const response = await getDepartments();
                const items = Array.isArray(response.data) ? response.data : response.data.results || [];
                setDepartments(items.length > 0 ? items : MOCK_DEPARTMENTS);
            } catch (err) {
                console.warn('Failed to fetch departments:', err);
                setDepartments(MOCK_DEPARTMENTS);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

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
                                                <span className="sub-title mb_5">About the company</span>
                                                <h2>Expertise and compassion saved my life</h2>
                                            </div>
                                            <div className="text-box mb_30 pb_30">
                                                <p>The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me</p>
                                            </div>
                                            <div className="inner-box">
                                                <div className="row clearfix">
                                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                        <div className="specialities-box">
                                                            <h4>Our Specialities</h4>
                                                            <ul className="list-style-one clearfix">
                                                                <li>Preventive care</li>
                                                                <li>Diagnostic testing</li>
                                                                <li>Mental health services</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                        <div className="specialities-box">
                                                            <h4>Our Vision</h4>
                                                            <ul className="list-style-one clearfix">
                                                                <li>To provide accessible and equitable</li>
                                                                <li>To use innovative technology</li>
                                                                <li>To empower patients</li>
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
                                            <figure className="image"><Image src="/website/assets/images/background/company.jpg" alt="Company Overview" width={523} height={399} priority /></figure>
                                            <div className="text-box">
                                                <div className="image-shape" style={{ backgroundImage: "url(/website/assets/images/shape/shape-7.png)" }}></div>
                                                <h2>30</h2>
                                                <span>Years of Experience in This Field</span>
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
                                departments.slice(0, 3).map((dept: any) => (
                                    <div key={dept.id} className="col-lg-4 col-md-6 col-sm-12 service-block">
                                        <div className="service-block-one">
                                            <div className="inner-box">
                                                <figure className="image-box"><Image src={dept.image || "/website/assets/images/service/service-1.jpg"} alt={dept.name} width={416} height={358} priority /></figure>
                                                <div className="lower-content">
                                                    <div className="inner">
                                                        <div className="icon-box"><i className="icon-18"></i></div>
                                                        <h3><Link to="/website/departments">{dept.name}</Link></h3>
                                                        <p>{dept.description || "Professional healthcare services for your well-being."}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="appointment-section about-page">
                    <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-17.png)" }}></div>
                    <figure className="image-layer"><Image src="/website/assets/images/resource/women-1.png" alt="Image" width={488} height={591} priority /></figure>
                    <div className="outer-container clearfix">
                        <div className="left-column">
                            <div className="bg-layer" style={{ backgroundImage: "url(/website/assets/images/background/company.jpg)" }}></div>
                            <div className="content-box">
                                <div className="icon-box"><Image src="/website/assets/images/icons/icon-4.svg" alt="Icon" width={88} height={88} priority /></div>
                                <h3>Need a Doctor for Check-up? Call for an Emergency Service!</h3>
                                <span><Link to="tel:112345615523">Call: +1 (123)-456-155-23</Link></span>
                            </div>
                        </div>
                        <div className="right-column">
                            <div className="form-inner">
                                <div className="shape" style={{ backgroundImage: "url(/website/assets/images/shape/shape-16.png)" }}></div>
                                <h3>Make an Appointment </h3>
                                <form action="/website" method="post">
                                    <div className="form-group">
                                        <div className="icon"><i className="icon-45"></i></div>
                                        <input type="text" name="name" placeholder="Name" required/>
                                    </div>
                                    <div className="form-group">
                                        <div className="icon"><i className="icon-46"></i></div>
                                        <input type="email" name="email" placeholder="Email" required/>
                                    </div>
                                    <div className="form-group">
                                        <div className="icon"><i className="icon-48"></i></div>
                                        <textarea name="message" placeholder="Message"></textarea>
                                    </div>
                                    <div className="message-btn">
                                        <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="funfact-section">
                {/* Background patterns */}
                <div className="pattern-layer">
                    <div className="pattern-1">
                    <svg
                        width="318"
                        height="131"
                        viewBox="0 0 318 131"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M0 69.0468L74.0685 69.0468L98.2276 40.7213L125.459 121L164.762 10L191.919 105.268L208.417 57.4162L233.167 87.0291L249.076 69.0468L308 69.0468"
                        stroke="#BDBDBD"
                        strokeOpacity="0.15"
                        strokeWidth="20"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                    </svg>
                    </div>
                </div>

                <div className="auto-container">
                    <div className="inner-container">
                    <div
                        className="shape"
                        style={{ backgroundImage: "url(/website/assets/images/shape/shape-34.png)" }}
                    ></div>

                    <div className="row clearfix">
                        {/* Block 1 */}
                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-37"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={180} duration={1.5} />
                                <span>+</span>
                            </div>
                            <p>Expert Doctors</p>
                            </div>
                        </div>
                        </div>

                        {/* Block 2 */}
                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-38"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={12.2} duration={1.5} decimals={1} />
                                <span>+</span>
                            </div>
                            <p>Different Services</p>
                            </div>
                        </div>
                        </div>

                        {/* Block 3 */}
                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-39"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={200} duration={1.5} />
                                <span>+</span>
                            </div>
                            <p>Multi Services</p>
                            </div>
                        </div>
                        </div>

                        {/* Block 4 */}
                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-40"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={8} duration={1.5} />
                            </div>
                            <p>Awards Win</p>
                            </div>
                        </div>
                        </div>
                    </div>
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
