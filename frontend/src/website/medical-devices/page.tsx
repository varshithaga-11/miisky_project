import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { getMedicalDevices, getMedicalDeviceCategories } from "../../utils/api";

export default function MedicalDevicesPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const location = useLocation();
    const navigate = useNavigate();
    const [devices, setDevices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;

    // Get category ID from query params
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get("category");

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Innovative Medical Solutions");
        const fetchDevicesData = async () => {
            try {
                setLoading(true);
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

    useEffect(() => {
        if (categoryId && !isNaN(Number(categoryId)) && categories.length > 0) {
            const cat = categories.find(c => String(c.id) === String(categoryId));
            if (cat && cat.uid) {
                navigate(`/medical-devices?category=${cat.uid}`, { replace: true });
            }
        }
        setCurrentPage(1); // Reset page on category change
    }, [categoryId, categories, navigate]);

    const filteredDevices = useMemo(() => {
        if (!categoryId) return devices;
        return devices.filter(device => 
            device.category === categoryId || 
            device.category_id === categoryId || 
            String(device.category) === String(categoryId) ||
            String(device.category_id) === String(categoryId) ||
            (device.category_uid && device.category_uid === categoryId)
        );
    }, [devices, categoryId]);

    const totalPages = Math.ceil(filteredDevices.length / PAGE_SIZE) || 1;
    const displayedDevices = filteredDevices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const activeCategoryName = useMemo(() => {
        if (!categoryId) return null;
        return categories.find(c => String(c.uid || c.id) === String(categoryId))?.name;
    }, [categories, categoryId]);

    return (
        <section className="medical-devices-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Explore our Technology</span>
                    <h2>{activeCategoryName ? `${activeCategoryName} Solutions` : "Our Medical Devices"}</h2>
                    <p>Revolutionizing healthcare with precision instruments and innovative medical technology.</p>
                </div>


                <div className="category-filters-container mb_60 d-flex flex-wrap justify-content-center gap_15" style={{ position: 'relative', zIndex: 10 }}>
                    <Link 
                        to="/medical-devices" 
                        className="filter-pill"
                        style={{
                            padding: '12px 28px',
                            borderRadius: '50px',
                            fontSize: '14px',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s ease',
                            backgroundColor: !categoryId ? '#0646ac' : '#fff',
                            color: !categoryId ? '#fff' : '#111827',
                            border: '1px solid',
                            borderColor: !categoryId ? '#0646ac' : '#eee',
                            boxShadow: !categoryId ? '0 10px 20px rgba(6,70,172,0.2)' : '0 2px 5px rgba(0,0,0,0.03)',
                            textTransform: 'uppercase'
                        }}
                    >
                        All Solutions
                    </Link>
                    {categories.map(cat => (
                        <Link 
                            key={cat.uid || cat.id} 
                            to={`/medical-devices?category=${cat.uid || cat.id}`}
                            className="filter-pill"
                            style={{
                                padding: '12px 28px',
                                borderRadius: '50px',
                                fontSize: '14px',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                transition: 'all 0.3s ease',
                                backgroundColor: String(categoryId) === String(cat.uid || cat.id) ? '#0646ac' : '#fff',
                                color: String(categoryId) === String(cat.uid || cat.id) ? '#fff' : '#111827',
                                border: '1px solid',
                                borderColor: String(categoryId) === String(cat.uid || cat.id) ? '#0646ac' : '#eee',
                                boxShadow: String(categoryId) === String(cat.uid || cat.id) ? '0 10px 20px rgba(6,70,172,0.2)' : '0 2px 5px rgba(0,0,0,0.03)',
                                textTransform: 'uppercase'
                            }}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center p-5" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0646ac', fontWeight: 700, fontSize: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        <div className="animate-pulse">Retrieving Innovative Solutions...</div>
                    </div>
                ) : filteredDevices.length === 0 ? (
                    <div className="text-center p_100" style={{ backgroundColor: '#f9fafb', borderRadius: '30px', border: '2px dashed #eee' }}>
                        <div className="mb_30 text-gray-300" style={{ fontSize: '60px' }}>
                            <i className="fas fa-microscope"></i>
                        </div>
                        <h3 className="mb_20" style={{ fontWeight: 800 }}>No products found in "{activeCategoryName}"</h3>
                        <p className="mb_30">We are constantly updating our portfolio. Please check other categories or view our full range.</p>
                        <Link to="/medical-devices" className="theme-btn btn-one" style={{ borderRadius: '50px' }}>
                            <span>View All Products</span>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="row clearfix">
                            {displayedDevices.map((device) => (
                                <div key={device.id} className="col-lg-4 col-md-6 col-sm-12 mb_40">
                                    <Link to={`/medical-devices/${device.uid || device.id}`} className="p_relative d-block h-100">
                                        <div className="device-card-premium h-100" style={{ 
                                            backgroundColor: '#fff', 
                                            borderRadius: '30px', 
                                            overflow: 'hidden', 
                                            boxShadow: '0 15px 45px rgba(0,0,0,0.04)',
                                            border: '1px solid #f2f2f2',
                                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative'
                                        }}>
                                            <div className="image-wrapper p_relative" style={{ height: '280px', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                                                <div className="category-badge" style={{ 
                                                    position: 'absolute', 
                                                    top: '20px', 
                                                    left: '20px', 
                                                    zIndex: 2, 
                                                    backgroundColor: 'rgba(255,255,255,0.95)', 
                                                    backdropFilter: 'blur(10px)',
                                                    padding: '6px 16px', 
                                                    borderRadius: '30px',
                                                    fontSize: '11px',
                                                    fontWeight: 800,
                                                    color: '#0646ac',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                                                }}>
                                                    {categories.find(c => c.id === device.category || c.id === device.category_id || c.uid === device.category_uid)?.name || "Medical Tech"}
                                                </div>
                                                <Image 
                                                    src={device.image_url || device.image || "/website/assets/images/service/service-1.jpg"} 
                                                    alt={device.name} 
                                                    width={400} 
                                                    height={280} 
                                                    style={{ objectFit: 'contain', width: '100%', height: '100%', transition: 'transform 0.8s ease', padding: '20px' }} 
                                                />
                                            </div>

                                            <div className="card-body p_30 d-flex flex-column" style={{ flex: 1 }}>
                                                <h3 className="mb_15" style={{ fontSize: '24px', fontWeight: 900, color: '#111827', lineHeight: '1.2' }}>{device.name}</h3>
                                                <p className="mb_25" style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.7', flex: 1 }}>
                                                    {device.short_description || (device.description ? device.description.substring(0, 90) + "..." : "Precision-engineered medical solution for advanced clinical diagnostic and monitoring workflows.")}
                                                </p>
                                                
                                                <div className="card-footer-box pt_25 d-flex align-items-center justify-content-between border-top" style={{ borderColor: '#f2f2f2' }}>
                                                    {device.price ? (
                                                        <div className="price-info">
                                                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Market Price</span>
                                                            <span style={{ color: '#111827', fontWeight: 900, fontSize: '20px' }}>
                                                                <span style={{ fontSize: '14px', marginRight: '2px' }}>₹</span>
                                                                {Number(device.price).toLocaleString('en-IN')}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0646ac' }}>Innovative Care</span>
                                                    )}
                                                    <div className="btn-box">
                                                        <div className="view-details-btn d-flex align-items-center justify-content-center" style={{ 
                                                            backgroundColor: '#0646ac', 
                                                            color: '#fff', 
                                                            padding: '10px 24px', 
                                                            borderRadius: '30px', 
                                                            fontSize: '13px', 
                                                            fontWeight: 800, 
                                                            textTransform: 'uppercase', 
                                                            letterSpacing: '1px',
                                                            boxShadow: '0 8px 20px rgba(6, 70, 172, 0.15)',
                                                            transition: 'all 0.3s ease',
                                                            cursor: 'pointer'
                                                        }}>
                                                            View Details
                                                            <i className="fas fa-arrow-right ml_10" style={{ fontSize: '11px' }}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination-wrapper centred mt_40">
                                <ul className="pagination clearfix">
                                    <li>
                                        <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
                                            <i className="icon-21"></i>
                                        </Link>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i+1}>
                                            <Link to="#" className={currentPage === i + 1 ? "current" : ""} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                                                {(i + 1).toString().padStart(2, '0')}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
                                            <i className="icon-22"></i>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
