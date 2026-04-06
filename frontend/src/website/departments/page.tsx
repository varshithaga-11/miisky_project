import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getDepartments, createWebsiteInquiry } from "../../utils/api";
import { MOCK_DEPARTMENTS } from "../utils/mockData";
import { getDepartmentIcon } from "../../utils/departmentIcons";
import Cta from "../components/sections/home2/Cta";

export default function DepartmentsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { uid } = useParams<{ uid: string }>();
    const [, setActiveTab] = useState(1);
    const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await createWebsiteInquiry({
                ...formState,
                subject: "Appointment Request from Departments Page"
            });
            toast.success("Your request has been sent successfully!");
            setFormState({
                name: "",
                email: "",
                phone: "",
                message: ""
            });
        } catch (error) {
            console.error("Failed to send inquiry:", error);
            toast.error("Failed to send request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Our Departments");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                setLoading(true);
                const response = await getDepartments();
                const data = Array.isArray(response?.data) 
                    ? response.data 
                    : response?.data?.results || response?.data?.data || [];
                
                setDepartments(data.length > 0 ? data : MOCK_DEPARTMENTS);
            } catch (err) {
                console.warn('Failed to fetch departments:', err);
                setDepartments(MOCK_DEPARTMENTS);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);


    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

    return (
        <div className="boxed_wrapper">
                <section className="service-page-section p_relative pb_100 pt_100">
                    <div className="auto-container">
                        <div className="sec-title centred mb_60">
                            <span className="sub-title mb_5">Medical Services</span>
                            <h2>Dedicated Healthcare Departments</h2>
                            <p>Miisky provides specialized medical care across various departments, <br />focusing on innovative diagnosis and personalized treatment paths.</p>
                        </div>
                        <div className="row clearfix">
                            {departments.map((dept: any) => (
                                <div key={dept.uid || dept.id} className="col-lg-4 col-md-6 col-sm-12 service-block-column mb_30">
                                    <div className="service-block-one">
                                        <div className="inner-box">
                                            <figure className="image-box">
                                                <Image src={dept.image || "/website/assets/images/service/service-1.jpg"} alt={dept.name} width={416} height={358} priority />
                                            </figure>
                                            <div className="lower-content">
                                                <div className="inner">
                                                    <div className="icon-box">
                                                        <img
                                                            src={getDepartmentIcon(dept.icon_class || dept.icon || "").src}
                                                            alt={dept.name}
                                                            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <h3><Link to={`/department-details/${dept.uid || dept.id}`}>{dept.name}</Link></h3>
                                                    <p>{dept.description?.substring(0, 80)}...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* <Video/> */}

                {/* <section className="chooseus-section service-page sec-pad p_relative">
                    <div className="auto-container">
                        <div className="sec-title centred mb_55">
                        <span className="sub-title mb_5">Why Choose Us</span>
                        <h2>What&apos;s Our Speciality</h2>
                        <p>
                            Medical care is the practice of providing diagnosis, treatment, and
                            preventive care for various <br /> illnesses, injuries, and diseases. It
                        </p>
                        </div>

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
                                        style={{ backgroundImage: `url(/website/assets/images/background/company.jpg)` }}
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
                                            <Link to="/departments" className="theme-btn btn-two">
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
                </section> */}

                <section className="appointment-style-two p_relative" style={{ 
                    backgroundImage: "url(/website/assets/images/background/appointment-bg-1.jpg)",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '100px 0'
                }}>
                    <div className="bg-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)' }}></div>
                    <div className="auto-container p_relative z_5">
                        <div className="inner-box">
                            <h2>Make an Appointment</h2>
                            <form onSubmit={handleFormSubmit} className="default-form">
                                <div className="row clearfix">
                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><i className="icon-45"></i></div>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                placeholder="Name" 
                                                required
                                                value={formState.name}
                                                onChange={(e) => setFormState({...formState, name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><i className="icon-46"></i></div>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                placeholder="Email (Optional)" 
                                                value={formState.email}
                                                onChange={(e) => setFormState({...formState, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><Image src="/website/assets/images/icons/icon-18.svg" alt="Image" width={14} height={15} priority /></div>
                                            <input 
                                                type="text" 
                                                name="phone" 
                                                placeholder="Phone" 
                                                required
                                                value={formState.phone}
                                                onChange={(e) => setFormState({...formState, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                                        <div className="form-group">
                                            <div className="icon"><i className="icon-48"></i></div>
                                            <textarea 
                                                name="message" 
                                                placeholder="Message"
                                                value={formState.message}
                                                onChange={(e) => setFormState({...formState, message: e.target.value})}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                                        <div className="form-group message-btn">
                                            <button type="submit" className="theme-btn btn-two" disabled={submitting}>
                                                <span>{submitting ? "Sending..." : "Send your message"}</span>
                                            </button>
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
