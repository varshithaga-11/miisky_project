import { useState, useEffect } from "react";
import Image from "../components/Image";
import { Link, useParams } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Cta from "../components/sections/home2/Cta";
import { getDepartmentById, getDepartments, getCompanyInfo } from "../../utils/api";
import AppointmentForm from "../components/elements/AppointmentForm";
import { MOCK_DEPARTMENTS } from "../utils/mockData";

export default function DepartmentDetails() {
    const { id } = useParams<{ id: string }>();
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [department, setDepartment] = useState<any>(MOCK_DEPARTMENTS[0] || {});
    const [departments, setDepartments] = useState<any[]>(MOCK_DEPARTMENTS);
    const [loading, setLoading] = useState(true);
    const [openHours, setOpenHours] = useState<string>("");

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle(department.name || "Department Details");
    }, [setHeaderStyle, setBreadcrumbTitle, department.name]);

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                // Fetch dynamic department based on ID
                const deptId = id ? parseInt(id) : 1;
                const response = await getDepartmentById(deptId);
                setDepartment(response.data || MOCK_DEPARTMENTS[0]);
            } catch (err) {
                console.warn('Failed to fetch department:', err);
                setDepartment(MOCK_DEPARTMENTS[0]);
            }
        };

        const fetchAllDepartments = async () => {
            try {
                const response = await getDepartments();
                let items = [];
                
                if (Array.isArray(response?.data)) {
                  items = response.data;
                } else if (response?.data?.results && Array.isArray(response.data.results)) {
                  items = response.data.results;
                } else if (Array.isArray(response?.data?.data)) {
                  items = response.data.data;
                }
                
                setDepartments(items.length > 0 ? items : MOCK_DEPARTMENTS);
            } catch (err) {
                console.warn('Failed to fetch departments:', err);
                setDepartments(MOCK_DEPARTMENTS);
            } finally {
                setLoading(false);
            }
        };

        const fetchCompanyInfo = async () => {
            try {
                const response = await getCompanyInfo();
                let info = null;
                if (Array.isArray(response?.data) && response.data.length > 0) {
                    info = response.data[0];
                } else if (response?.data && !Array.isArray(response.data)) {
                    info = response.data;
                }
                if (info?.open_hours) {
                    setOpenHours(info.open_hours);
                }
            } catch (err) {
                console.warn('Failed to fetch company info:', err);
            }
        };

        fetchDepartment();
        fetchAllDepartments();
        fetchCompanyInfo();
    }, [id]);

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
                                                {departments.map((dept: any) => (
                                                    <li key={dept.id}><Link to={`/department-details/${dept.id}`} className={department.id === dept.id ? "current" : ""}>{dept.name}</Link></li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget appointment-widget mb_40">
                                        <div className="widget-title">
                                            <h2>Appointment</h2>
                                        </div>
                                        <div className="form-inner">
                                            <AppointmentForm departmentName={department.name} />
                                        </div>
                                    </div>
                                    <div className="sidebar-widget schedule-widget">
                                        <div className="widget-title">
                                            <h2>Working Hours</h2>
                                        </div>
                                        <div className="widget-content">
                                            {openHours ? (
                                                <ul className="schedule-list clearfix">
                                                    {openHours.split(',').map((entry, idx) => {
                                                        const parts = entry.trim().split(':');
                                                        const day = parts[0]?.trim();
                                                        const time = parts.slice(1).join(':').trim();
                                                        return (
                                                            <li key={idx}>
                                                                {day}
                                                                {time && <span>{time}</span>}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <ul className="schedule-list clearfix">
                                                    <li>Mon - Fri<span>9:30am to 6:00pm</span></li>
                                                    <li>Saturday<span>9:30am to 2:30pm</span></li>
                                                    <li>Sunday<span>Closed</span></li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="service-details-content">
                                    <div className="content-one mb_40">
                                        <div className="text-box">
                                            <h2>{department.name || "Department"}</h2>
                                            <p>{department.description || department.short_description || "Department information and services available."}</p>
                                            <p>Professional medical services and expertise in this specialized field.</p>
                                        </div>
                                    </div>
                                    <div className="content-two">
                                        <figure className="image-box mb_30 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                            <Image 
                                                src={department.image || "/website/assets/images/service/service-5.jpg"} 
                                                alt={department.name} 
                                                className="w-100"
                                                style={{ 
                                                    maxHeight: '450px', 
                                                    objectFit: 'contain', 
                                                    display: 'block', 
                                                    margin: '0 auto' 
                                                }}
                                                priority 
                                            />
                                        </figure>
                                        <p>{department.description || "Advanced medical treatments and care supported by our expert team."}</p>
                                        <ul className="list-style-one clearfix">
                                            <li>Professional medical expertise and care</li>
                                            <li>State-of-the-art facilities and equipment</li>
                                            <li>Comprehensive patient support and treatment</li>
                                            <li>Dedicated healthcare professionals on staff</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Cta/>
        </div>
    );
}
