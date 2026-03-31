import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { getMedicalDevices, getMedicalDeviceCategories } from "../../utils/api";

export default function MedicalDevicesPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const location = useLocation();
    const [devices, setDevices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Get category ID from query params
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get("category");

    useEffect(() => {
        setHeaderStyle(1);
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

    const filteredDevices = useMemo(() => {
        if (!categoryId) return devices;
        return devices.filter(device => device.category === parseInt(categoryId) || device.category_id === parseInt(categoryId));
    }, [devices, categoryId]);

    const activeCategoryName = useMemo(() => {
        if (!categoryId) return null;
        return categories.find(c => c.id === parseInt(categoryId))?.name;
    }, [categories, categoryId]);

    return (
        <section className="medical-devices-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Explore our Technology</span>
                    <h2>{activeCategoryName ? `${activeCategoryName} Solutions` : "Our Medical Devices"}</h2>
                    <p>Revolutionizing healthcare with precision instruments and innovative medical technology.</p>
                </div>

                {categoryId && (
                    <div className="mb_30 centred">
                        <span style={{ fontSize: '14px', marginRight: '10px' }}>Filtered by Category: <strong>{activeCategoryName}</strong></span>
                        <Link to="/website/medical-devices" className="theme-btn btn-two" style={{ padding: '4px 15px', fontSize: '12px' }}>
                            <span>Show All Devices</span>
                        </Link>
                    </div>
                )}

                {loading ? (
                    <div className="text-center p-5">Loading medical devices...</div>
                ) : filteredDevices.length === 0 ? (
                    <div className="text-center p-5">
                        <h3 className="mb_20">No products found for this category.</h3>
                        <Link to="/website/medical-devices" className="theme-btn btn-one">
                            <span>View All Products</span>
                        </Link>
                    </div>
                ) : (
                    <div className="row clearfix">
                        {filteredDevices.map((device) => (
                            <div key={device.id} className="col-lg-4 col-md-6 col-sm-12 device-block mb_30">
                                <div className="device-block-one" style={{ padding: '0', border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 5px 20px rgba(0,0,0,0.06)' }}>
                                    <div className="inner-box" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <figure className="image-box" style={{ height: '240px', overflow: 'hidden' }}>
                                            <Image src={device.image_url || device.image || "/website/assets/images/service/service-1.jpg"} alt={device.name} width={400} height={250} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                        </figure>
                                        <div className="lower-content" style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div className="category-meta mb_10" style={{ color: '#0646ac', fontSize: '13px', fontWeight: 700 }}>
                                                {categories.find(c => c.id === device.category || c.id === device.category_id)?.name || "Medical Solutions"}
                                            </div>
                                            <h3 className="mb_15"><Link to={`/website/medical-devices/${device.id}`} style={{ color: '#111' }}>{device.name}</Link></h3>
                                            <p className="mb_20" style={{ color: '#555', fontSize: '14px', flex: 1 }}>{device.short_description || (device.description ? device.description.substring(0, 100) + "..." : "Advanced medical equipment designed for precision healthcare.")}</p>
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
