import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { getMedicalDeviceById, getMedicalDeviceCategories } from "../../utils/api";
import Cta from "../components/sections/home2/Cta";

export default function MedicalDeviceDetailsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { id } = useParams<{ id: string }>();
    const [device, setDevice] = useState<any>(null);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Device Details");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchDeviceData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [deviceRes, categoriesRes] = await Promise.all([
                    getMedicalDeviceById(parseInt(id)),
                    getMedicalDeviceCategories()
                ]);
                
                const deviceData = deviceRes.data;
                setDevice(deviceData);
                
                const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || [];
                const foundCategory = categories.find((c: any) => c.id === deviceData.category_id);
                setCategory(foundCategory);
            } catch (err) {
                console.error("Failed to fetch medical device details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDeviceData();
    }, [id]);

    if (loading) return <div className="text-center p-5 mt_100">Loading device details...</div>;
    if (!device) return <div className="text-center p-5 mt_100">Device not found. <Link to="/website/medical-devices">Go back</Link></div>;

    return (
        <div className="medical-device-details-page">
            <section className="device-details-section p_relative sec-pad">
                <div className="auto-container">
                    <div className="row clearfix">
                        <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                            <div className="image-box p_relative d_block mr_40" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }}>
                                <Image 
                                    src={device.image_url || "/website/assets/images/service/service-details.jpg"} 
                                    alt={device.name} 
                                    width={600} 
                                    height={500}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                            <div className="content-box p_relative d_block">
                                <div className="sec-title mb_25">
                                    <span className="sub-title mb_5">{category?.name || "Medical Technology"}</span>
                                    <h2>{device.name}</h2>
                                </div>
                                <div className="text mb_30">
                                    <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555' }}>
                                        {device.description || "Our advanced medical devices are designed to provide the highest level of precision and reliability in healthcare."}
                                    </p>
                                </div>
                                <div className="features-box mb_40">
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Key Specifications</h3>
                                    <ul className="list-item clearfix" style={{ paddingLeft: '0', listStyle: 'none' }}>
                                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                            <i className="fas fa-check-circle" style={{ color: '#0646ac', marginRight: '10px' }}></i>
                                            Advanced Sensor Technology
                                        </li>
                                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                            <i className="fas fa-check-circle" style={{ color: '#0646ac', marginRight: '10px' }}></i>
                                            Ergonomic Design for Ease of Use
                                        </li>
                                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                            <i className="fas fa-check-circle" style={{ color: '#0646ac', marginRight: '10px' }}></i>
                                            Certified for International Standards
                                        </li>
                                        <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                            <i className="fas fa-check-circle" style={{ color: '#0646ac', marginRight: '10px' }}></i>
                                            Real-time Data Monitoring
                                        </li>
                                    </ul>
                                </div>
                                <div className="btn-box">
                                    <Link to="/website/contact" className="theme-btn btn-one">
                                        <span>Request Quote</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row clearfix mt_60">
                        <div className="col-lg-12">
                            <div className="tabs-box">
                                <div className="tab-buttons-box">
                                    <ul className="tab-buttons clearfix" style={{ listStyle: 'none', padding: '0', display: 'flex', borderBottom: '1px solid #eee' }}>
                                        <li className="tab-btn active-btn" style={{ padding: '15px 30px', cursor: 'pointer', fontWeight: 700, borderBottom: '3px solid #0646ac' }}>Overview</li>
                                        <li className="tab-btn" style={{ padding: '15px 30px', cursor: 'pointer', fontWeight: 600, color: '#777' }}>Additional Info</li>
                                    </ul>
                                </div>
                                <div className="tabs-content" style={{ padding: '30px 0' }}>
                                    <div className="tab active-tab">
                                        <div className="text">
                                            <p>{device.long_description || "This medical device represents the pinnacle of our engineering and clinical research. Designed to meet the demanding needs of modern healthcare facilities, it combines robust performance with intuitive operation. Every aspect has been meticulously tested to ensure patient safety and clinical accuracy."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Cta />
        </div>
    );
}
