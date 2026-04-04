import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { getMedicalDeviceById, getMedicalDeviceCategories, getDeviceFeatures } from "../../utils/api";
import Cta from "../components/sections/home2/Cta";

export default function MedicalDeviceDetailsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { uid } = useParams<{ uid: string }>();
    const [device, setDevice] = useState<any>(null);
    const [category, setCategory] = useState<any>(null);
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Device Details");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchDeviceData = async () => {
            if (!uid) return;
            try {
                setLoading(true);
                const [deviceRes, categoriesRes, featuresRes] = await Promise.all([
                    getMedicalDeviceById(uid),
                    getMedicalDeviceCategories(),
                    getDeviceFeatures(uid)
                ]);
                
                const deviceData = deviceRes.data;
                setDevice(deviceData);
                
                const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || [];
                const foundCategory = categories.find((c: any) => c.id === deviceData.category_id || c.uid === deviceData.category_uid);
                setCategory(foundCategory);

                const featuresData = Array.isArray(featuresRes.data) ? featuresRes.data : featuresRes.data.results || [];
                setFeatures(featuresData);
            } catch (err) {
                console.error("Failed to fetch medical device details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDeviceData();
    }, [uid]);

    if (loading) return <div className="text-center p-5 mt_100">Loading device details...</div>;
    if (!device) return <div className="text-center p-5 mt_100">Device not found. <Link to="/medical-devices">Go back</Link></div>;

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
                                    <h2 style={{ fontSize: '44px', fontWeight: 900, color: '#111827', marginBottom: '8px' }}>{device.name}</h2>
                                    {device.price && (
                                        <div className="price-display mb_15" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0646ac', textTransform: 'uppercase', letterSpacing: '2px' }}>Starting from</span>
                                            <span style={{ fontSize: '32px', fontWeight: 900, color: '#111827' }}>
                                                <span style={{ fontSize: '20px', verticalAlign: 'middle', marginRight: '2px', opacity: 0.8 }}>₹</span>
                                                {Number(device.price).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="text mb_35">
                                    <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#4b5563', fontWeight: '500', fontStyle: 'italic', marginBottom: '15px' }}>
                                        {device.short_description}
                                    </p>
                                    <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#4b5563', fontWeight: '400' }}>
                                        {device.description || "Our advanced medical devices are designed to provide the highest level of precision and reliability in healthcare, ensuring optimal clinical outcomes."}
                                    </p>
                                </div>
                                <div className="features-box mb_40">
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '30px', position: 'relative', paddingBottom: '15px' }}>
                                        Key Specifications
                                        <span style={{ position: 'absolute', bottom: 0, left: 0, width: '60px', height: '4px', background: '#0646ac', borderRadius: '10px' }}></span>
                                    </h3>
                                    <div className="row clearfix">
                                        {features.length > 0 ? (
                                            features.map((feature: any) => (
                                                <div key={feature.id} className="col-lg-6 col-md-6 col-sm-12 mb_20">
                                                    <div style={{ 
                                                        padding: '24px', 
                                                        background: '#ffffff', 
                                                        borderRadius: '16px', 
                                                        border: '1px solid #eaeaea',
                                                        boxShadow: '0 5px 15px rgba(0,0,0,0.02)',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    className="spec-card"
                                                    >
                                                        <div style={{ 
                                                            width: '45px', 
                                                            height: '45px', 
                                                            borderRadius: '12px', 
                                                            background: '#f0f7ff', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            marginRight: '18px',
                                                            flexShrink: 0,
                                                            border: '1px solid rgba(6, 70, 172, 0.08)'
                                                        }}>
                                                            <i className="fas fa-check" style={{ color: '#0646ac', fontSize: '18px' }}></i>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '6px', color: '#111827' }}>{feature.title}</h4>
                                                            {feature.description && <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: 0, lineHeight: '1.6' }}>{feature.description}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <div className="col-lg-6 col-md-6 col-sm-12 mb_20">
                                                    <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                                            <i className="fas fa-check" style={{ color: '#0646ac', fontSize: '16px' }}></i>
                                                        </div>
                                                        <span style={{ fontWeight: 600, color: '#111827' }}>Advanced Monitoring</span>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-12 mb_20">
                                                    <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                                            <i className="fas fa-check" style={{ color: '#0646ac', fontSize: '16px' }}></i>
                                                        </div>
                                                        <span style={{ fontWeight: 600, color: '#111827' }}>Precision Engineering</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="btn-box mt_10">
                                    <Link to="/contact" className="theme-btn btn-one" style={{ padding: '15px 40px', borderRadius: '50px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <span>Request Quote</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row clearfix mt_60">
                        <div className="col-lg-12">
                            <div className="content-box" style={{ 
                                padding: '50px', 
                                border: '1px solid #f0f0f0', 
                                borderRadius: '24px', 
                                background: '#f9fafb',
                                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.01)'
                            }}>
                                <h3 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '25px', color: '#111827', display: 'flex', alignItems: 'center' }}>
                                    <i className="fas fa-info-circle" style={{ color: '#0646ac', marginRight: '15px', fontSize: '22px' }}></i>
                                    Product Overview
                                </h3>
                                <div className="text" style={{ fontSize: '16px', lineHeight: '1.9', color: '#4b5563' }}>
                                    <p style={{ marginBottom: '0' }}>{device.long_description || "This medical device represents the pinnacle of our engineering and clinical research. Designed to meet the demanding needs of modern healthcare facilities, it combines robust performance with intuitive operation. Every aspect has been meticulously tested to ensure patient safety and clinical accuracy, providing healthcare professionals with the tools they need for exceptional patient care."}</p>
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
