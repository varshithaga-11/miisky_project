import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { getMedicalDevices, getMedicalDeviceCategories } from "../../utils/api";

export default function MedicalDevicesPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [devices, setDevices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Innovative Medical Solutions");
        const fetchDevicesData = async () => {
            try {
                const [devicesRes, categoriesRes] = await Promise.all([
                    getMedicalDevices(),
                    getMedicalDeviceCategories()
                ]);
                setDevices(Array.isArray(devicesRes.data) ? devicesRes.data : devicesRes.data.results || []);
                setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || []);
            } catch (err) {
                console.error("Failed to fetch medical device data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevicesData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <section className="medical-devices-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Explore our Technology</span>
                    <h2>Our Medical Devices</h2>
                    <p>Revolutionizing healthcare with precision instruments and innovative medical technology.</p>
                </div>
                {loading ? (
                    <div className="text-center p-5">Loading medical devices...</div>
                ) : devices.length === 0 ? (
                    <div className="text-center p-5">Our product catalog is currently being updated. Please check back soon.</div>
                ) : (
                    <div className="row clearfix">
                        {devices.map((device) => (
                            <div key={device.id} className="col-lg-4 col-md-6 col-sm-12 device-block mb_30">
                                <div className="device-block-one" style={{ padding: '0', border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 5px 20px rgba(0,0,0,0.06)' }}>
                                    <div className="inner-box" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <figure className="image-box" style={{ height: '240px', overflow: 'hidden' }}>
                                            <Image src={device.image_url || "/website/assets/images/service/service-1.jpg"} alt={device.name} width={400} height={250} />
                                        </figure>
                                        <div className="lower-content" style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div className="category-meta mb_10" style={{ color: '#0646ac', fontSize: '13px', fontWeight: 700 }}>{categories.find(c => c.id === device.category_id)?.name || "Medical Solutions"}</div>
                                            <h3 className="mb_15"><Link to={`/website/medical-devices/${device.id}`} style={{ color: '#111' }}>{device.name}</Link></h3>
                                            <p className="mb_20" style={{ color: '#555', fontSize: '14px', flex: 1 }}>{device.description ? device.description.substring(0, 100) + "..." : "Advanced medical equipment designed for precision healthcare."}</p>
                                            <div className="btn-box mt-auto">
                                                <Link to={`/website/medical-devices/${device.id}`} className="theme-btn btn-one" style={{ padding: '8px 20px', fontSize: '12px' }}>
                                                    <span>View Details</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
