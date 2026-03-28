import { useEffect, useState } from "react";
import ModalVideo from "../components/elements/VideoPopup";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getDepartments } from "../../utils/api";
import { MOCK_DEPARTMENTS } from "../utils/mockData";
import Video from "../components/sections/home3/Video";
import Cta from "../components/sections/home2/Cta";

export default function DepartmentsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [activeTab, setActiveTab] = useState(1);
    const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Our Departments");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                setLoading(true);
                const response = await getDepartments();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setDepartments(data.length > 0 ? data : MOCK_DEPARTMENTS);
                if (data.length > 0) setActiveTab(data[0].id);
            } catch (err) {
                console.warn('Failed to fetch departments:', err);
                setDepartments(MOCK_DEPARTMENTS);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

    const tabs = departments.map((dept: any) => ({ 
        id: dept.id, 
        title: dept.name || "Department" 
    }));

    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

    return (
        <div className="boxed_wrapper">
                <section className="service-page-section p_relative">
                    <div className="auto-container">
                        <div className="row clearfix">
                            {departments.map((dept: any) => (
                                <div key={dept.id} className="col-lg-4 col-md-6 col-sm-12 service-block">
                                    <div className="service-block-one">
                                        <div className="inner-box">
                                            <figure className="image-box">
                                                <Image src={dept.image || "/website/assets/images/service/service-1.jpg"} alt={dept.name} width={416} height={358} priority />
                                            </figure>
                                            <div className="lower-content">
                                                <div className="inner">
                                                    <div className="icon-box"><i className={dept.icon || "icon-18"}></i></div>
                                                    <h3><Link to={`/website/department-details/${dept.id}`}>{dept.name}</Link></h3>
                                                    <p>{dept.description?.substring(0, 60)}...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            {departments.map((content: any) => (
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
                                            <h3>{content.name}</h3>
                                            <p>{content.description}</p>
                                        </div>
                                        {content.list && content.list.length > 0 && (
                                            <ul className="list-style-one clearfix">
                                                {content.list.map((item: any, index: number) => (
                                                <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        )}
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
        </div>
    );
}
