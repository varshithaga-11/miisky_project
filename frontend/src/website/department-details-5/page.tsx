import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import Cta from "../components/sections/home2/Cta";
import { useState, useEffect } from "react";
import { getDepartmentById, getDepartments } from "../../utils/api";
import { MOCK_DEPARTMENTS } from "../utils/mockData";

export default function DepartmentDetailsFive() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [department, setDepartment] = useState<any>(MOCK_DEPARTMENTS[4] || {});
    const [departments, setDepartments] = useState<any[]>(MOCK_DEPARTMENTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle(department.name || "Department");
    }, [setHeaderStyle, setBreadcrumbTitle, department.name]);

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const response = await getDepartmentById(5);
                setDepartment(response.data || MOCK_DEPARTMENTS[4]);
            } catch (err) {
                console.warn('Failed to fetch department:', err);
                setDepartment(MOCK_DEPARTMENTS[4]);
            }
        };

        const fetchAllDepartments = async () => {
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

        fetchDepartment();
        fetchAllDepartments();
    }, []);

    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

    return (
        <div className="boxed_wrapper">
                <section className="service-details pt_120 pb_110">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                                <div className="service-sidebar">
                                    <div className="sidebar-widget category-widget mb_40">
                                        <div className="shape" style={{ backgroundImage: "url(/website/assets/images/shape/shape-41.png)" }}></div>
                                        <div className="widget-title">
                                            <h2>Departments</h2>
                                        </div>
                                        <div className="widget-content">
                                            <ul className="category-list clearfix">
                                                {departments.map((dept: any, idx: number) => (
                                                    <li key={dept.id}><Link to={idx === 0 ? "/website/department-details" : `/website/department-details-${idx + 1}`} className={department.id === dept.id ? "current" : ""}>{dept.name}</Link></li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget appointment-widget mb_40">
                                        <div className="widget-title">
                                            <h2>Appointment</h2>
                                        </div>
                                        <div className="form-inner">
                                            <form method="post" action="/website" className="default-form">
                                                <div className="form-group">
                                                    <div className="icon"><i className="icon-45"></i></div>
                                                    <input type="text" name="name" placeholder="Name" required/>
                                                </div>
                                                <div className="form-group">
                                                    <div className="icon"><i className="icon-46"></i></div>
                                                    <input type="email" name="email" placeholder="Email" required/>
                                                </div>
                                                <div className="form-group">
                                                    <div className="icon"><Image src="/website/assets/images/icons/icon-15.svg" alt="Image" width={15} height={15} priority /></div>
                                                    <div className="select-box">
                                                        <select className="selectmenu">
                                                            <option>I&apos;m interested in *</option>
                                                            <option>Heart Health</option>
                                                            <option>Cardiology</option>
                                                            <option>Dental</option>
                                                            <option>Gastroenterology</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <div className="icon"><i className="icon-48"></i></div>
                                                    <textarea name="message" placeholder="Message"></textarea>
                                                </div>
                                                <div className="form-group message-btn">
                                                    <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget schedule-widget">
                                        <div className="widget-title">
                                            <h2>Working Hours</h2>
                                        </div>
                                        <div className="widget-content">
                                            <ul className="schedule-list clearfix">
                                                <li>Sunday<span>02 pm to 06 pm</span></li>
                                                <li>Monday<span>03 pm to 07 pm</span></li>
                                                <li>Tuesday<span>02 pm to 06 pm</span></li>
                                                <li>Wednesday<span>02 pm to 06 pm</span></li>
                                                <li>Thursday<span>04 pm to 06 pm</span></li>
                                                <li>Friday<span>03 pm to 08 pm</span></li>
                                                <li>Saturday<span>Closed</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="service-details-content">
                                    <div className="content-one mb_40">
                                        <figure className="image-box mb_60"><Image src={department.image || "/website/assets/images/service/service-9.jpg"} alt={department.name} width={856} height={525} priority /></figure>
                                        <div className="text-box">
                                            <h2>{department.name || "Department"}</h2>
                                            <p>{department.description || department.short_description || "Department information and services available."}</p>
                                            <p>Professional medical services and expertise in this specialized field.</p>
                                        </div>
                                    </div>
                                    <div className="content-two">
                                        <figure className="image-box mb_30"><Image src={department.image || "/website/assets/images/service/service-5.jpg"} alt={department.name} width={856} height={525} priority /></figure>
                                        <p>{department.description || "Advanced medical treatments and care supported by our expert team."}</p>
                                        <ul className="list-style-one clearfix">
                                            <li>25-30% estimated savings in implementation when using Mobile Health Clinics</li>
                                            <li>Activate Mobile Health Clinics in just weeks</li>
                                            <li>Flexible, on-demand access to care services</li>
                                            <li>Supports referrals to provider networks and care management programs</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Cta/>
        </div>
    )
}
