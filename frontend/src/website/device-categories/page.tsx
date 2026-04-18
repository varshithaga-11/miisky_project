import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import { getMedicalDeviceCategories } from '@/utils/api';
import { getDeviceCategoryIcon } from "../../utils/deviceCategoryIcons";

export default function DeviceCategoriesPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Device Categories");
        const fetchCats = async () => {
            try {
                setLoading(true);
                const response = await getMedicalDeviceCategories();
                const rawData = Array.isArray(response.data) ? response.data : response.data.results || [];
                setCategories(rawData);
                setTotalPages(Math.ceil(rawData.length / PAGE_SIZE) || 1);
            } catch (err) {
                console.error("Failed to fetch device categories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCats();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    const displayedCategories = categories.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <section className="device-categories-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Our Expertise</span>
                    <h2>Technology Verticals</h2>
                    <p>We specialize in multiple medical domains, providing specialized technology for each need.</p>
                </div>
                {loading ? (
                    <div className="text-center p-5">Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center p-5">No categories found.</div>
                ) : (
                    <>
                        <div className="row clearfix">
                            {displayedCategories.map((cat) => (
                                <div key={cat.id} className="col-lg-4 col-md-6 col-sm-12 category-block mb_30">
                                    <div className="category-block-one" style={{ padding: '40px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fafafa', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                                        <div className="inner-box">
                                            <div className="icon-box mb_20" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <img 
                                                    src={getDeviceCategoryIcon(cat.icon_class || cat.icon || "").src} 
                                                    alt={cat.name} 
                                                    style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <h3 className="mb_15" style={{ fontWeight: '700', color: '#1a2b3c', fontSize: '24px' }}>{cat.name}</h3>
                                            <p className="mb_30" style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>{cat.description || "Leading-edge medical solutions for this specialty."}</p>
                                            <Link to={`/medical-devices?category=${cat.id}`} className="theme-btn btn-one" style={{ padding: '12px 30px', borderRadius: '30px', background: '#1a89dc', borderColor: '#1a89dc', fontSize: '13px', fontWeight: '600' }}>
                                                <span>VIEW PRODUCTS</span>
                                            </Link>
                                        </div>
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            .category-block-one:hover { border-color: #1a89dc; transform: translateY(-8px); background: #ffffff !important; box-shadow: 0 20px 40px rgba(26, 137, 220, 0.1) !important; }
                                        ` }} />
                                    </div>
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
