import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getMedicalDeviceCategories } from "../../utils/api";

export default function DeviceCategoriesPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Device Categories");
        const fetchCats = async () => {
            try {
                const response = await getMedicalDeviceCategories();
                setCategories(Array.isArray(response.data) ? response.data : response.data.results || []);
            } catch (err) {
                console.error("Failed to fetch device categories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCats();
    }, [setHeaderStyle, setBreadcrumbTitle]);

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
                    <div className="row clearfix">
                        {categories.map((cat) => (
                            <div key={cat.id} className="col-lg-4 col-md-6 col-sm-12 category-block mb_30">
                                <div className="category-block-one" style={{ padding: '40px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff', textAlign: 'center', transition: 'all 0.3s ease', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}>
                                    <div className="inner-box">
                                        <div className="icon-box mb_20" style={{ fontSize: '40px', color: '#0646ac' }}>
                                            <i className="fas fa-microscope"></i>
                                        </div>
                                        <h3 className="mb_15">{cat.name}</h3>
                                        <p className="mb_20" style={{ color: '#555' }}>{cat.description || "Leading-edge medical solutions for this specialty."}</p>
                                        <Link to={`/website/medical-devices?category=${cat.id}`} className="theme-btn btn-one" style={{ padding: '8px 25px' }}>
                                            <span>View Products</span>
                                        </Link>
                                    </div>
                                    <style dangerouslySetInnerHTML={{ __html: `
                                        .category-block-one:hover { border-color: #0646ac; transform: translateY(-5px); box-shadow: 0 10px 25px rgba(6, 70, 172, 0.1); }
                                    ` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
