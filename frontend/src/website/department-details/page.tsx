import { useState, useEffect } from "react";
import Image from '@website/components/Image';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import Cta from '@website/components/sections/home2/Cta';
import { getDepartmentById, getDepartments, getCompanyInfo } from '@/utils/api';
import AppointmentForm from '@website/components/elements/AppointmentForm';
import { MOCK_DEPARTMENTS } from "../utils/mockData";

export default function DepartmentDetails() {
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
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
                if (uid) {
                    const response = await getDepartmentById(uid);
                    setDepartment(response.data || MOCK_DEPARTMENTS[0]);
                } else {
                    setDepartment(MOCK_DEPARTMENTS[0]);
                }
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
    }, [uid]);

    useEffect(() => {
        if (department?.uid && String(uid) === String(department.id)) {
            navigate(`/department-details/${department.uid}`, { replace: true });
        }
    }, [department, uid, navigate]);

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
                                                    <li key={dept.uid || dept.id}><Link to={`/department-details/${dept.uid || dept.id}`} className={(department?.uid === dept.uid || department?.id === dept.id) ? "current" : ""}>{dept.name}</Link></li>
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
                                    <div className="content-one mb_50">
                                        <div className="text-box p_relative d_block">
                                            <span className="p-2 mb_15 d-inline-block" style={{ backgroundColor: '#f0f4ff', borderRadius: '8px', color: '#0646ac', fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                                {department.tagline || department.short_description || "Specialized Expertise"}
                                            </span>
                                            <h2 className="mb_30" style={{ fontSize: '42px', fontWeight: 900, color: '#111' }}>{department.name}</h2>
                                            
                                            <div className="expertise-card p-4 mb_40" style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '20px', boxShadow: '0 15px 40px rgba(0,0,0,0.05)', borderLeft: '6px solid #0646ac' }}>
                                                <h4 className="mb_15" style={{ fontWeight: 800, color: '#111' }}>Strategic Expertise</h4>
                                                <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.8' }}>
                                                    {department.expertise_text || "Our dedicated team combines advanced methodology with deep industry expertise to provide reliable solutions and exceptional care quality."}
                                                </p>
                                            </div>

                                            <div className="main-image mb_50">
                                                <figure className="image-box overflow-hidden" style={{ borderRadius: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                                                    <Image 
                                                        src={department.image || "/website/assets/images/service/service-5.jpg"} 
                                                        alt={department.name} 
                                                        className="w-100"
                                                        style={{ 
                                                            maxHeight: '500px', 
                                                            objectFit: 'cover', 
                                                            display: 'block'
                                                        }}
                                                        priority 
                                                    />
                                                </figure>
                                            </div>

                                            <div className="description-section mb_50">
                                                <h3 className="mb_20" style={{ fontWeight: 800 }}>Departmental Overview</h3>
                                                <p style={{ fontSize: '17px', color: '#555', lineHeight: '1.9' }}>
                                                    {department.description || "Consistently pushing the boundaries of medical science, this department focuses on integrating state-of-the-art technologies with compassionate care to elevate patient outcomes and operational efficiency."}
                                                </p>
                                            </div>

                                            <div className="features-grid">
                                                <h3 className="mb_25" style={{ fontWeight: 800 }}>Key Capabilities</h3>
                                                <div className="row clearfix">
                                                    {(department.key_features && department.key_features.length > 0 ? department.key_features : [
                                                        "Professional medical expertise and care",
                                                        "State-of-the-art facilities and equipment",
                                                        "Comprehensive patient support and treatment",
                                                        "Dedicated healthcare professionals on staff"
                                                    ]).map((feature: string, index: number) => (
                                                        <div key={index} className="col-lg-6 col-md-6 col-sm-12 mb_20">
                                                            <div className="feature-item p-3 d-flex align-items-center" style={{ backgroundColor: '#fcfcfc', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                                                                <div className="icon-box mr_15" style={{ width: '30px', height: '30px', backgroundColor: '#e1f9eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dcc70', fontSize: '12px' }}>
                                                                    <i className="fas fa-check"></i>
                                                                </div>
                                                                <span style={{ fontWeight: 600, color: '#444', fontSize: '15px' }}>{feature}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
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
