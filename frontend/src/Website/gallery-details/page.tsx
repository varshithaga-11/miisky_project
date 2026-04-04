import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getGalleryItemById, getGalleryCategories } from "../../utils/api";
import Image from "../components/Image";
import Cta from "../components/sections/home2/Cta";

export default function GalleryDetailsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<any>(null);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Gallery Item");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchItemData = async () => {
            if (!uid) return;
            try {
                setLoading(true);
                const [itemRes, categoriesRes] = await Promise.all([
                    getGalleryItemById(uid),
                    getGalleryCategories()
                ]);
                
                setItem(itemRes.data);
                const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || [];
                setCategory(categories.find((c: any) => c.id === itemRes.data.category_id || c.uid === itemRes.data.category_uid));
            } catch (err) {
                console.error("Failed to fetch gallery item details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItemData();
    }, [uid]);

    useEffect(() => {
        if (item?.uid && String(uid) === String(item.id)) {
            navigate(`/gallery-details/${item.uid}`, { replace: true });
        }
    }, [item, uid, navigate]);

    if (loading) return <div className="text-center p-5 mt_100">Loading gallery item...</div>;
    if (!item) return <div className="text-center p-5 mt_100">Gallery item not found. <Link to="/gallery">Go back</Link></div>;

    return (
        <div className="gallery-details-page">
            <section className="gallery-details-section p_relative sec-pad-2">
                <div className="auto-container">
                    <div className="row clearfix">
                        <div className="col-lg-12 col-md-12 col-sm-12 image-column">
                            <div className="image-box p_relative d_block mb_50" style={{ borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
                                <Image 
                                    src={item.image_url || "/website/assets/images/gallery/gallery-details.jpg"} 
                                    alt={item.title} 
                                    width={1200} 
                                    height={800}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    priority
                                />
                            </div>
                        </div>
                        <div className="col-lg-8 col-md-12 col-sm-12 mx-auto content-column">
                            <div className="content-box p_relative d_block text-center">
                                <div className="sec-title mb_25">
                                    <span className="sub-title mb_5">{category?.name || "Medical Gallery"}</span>
                                    <h2>{item.title}</h2>
                                </div>
                                <div className="text mb_40">
                                    <p style={{ fontSize: '18px', lineHeight: '1.9', color: '#555' }}>
                                        {item.description || "Captured moment showcasing our commitment to healthcare innovation and patient well-being at Miisky."}
                                    </p>
                                </div>
                                <div className="item-meta mb_40 p-4 d-inline-flex align-items-center" style={{ backgroundColor: '#f0f4ff', borderRadius: '40px', border: '1px solid #11111111' }}>
                                    <span className="mr_30 ml_15"><i className="far fa-calendar-alt mr_5" style={{ color: '#0646ac' }}></i> Date: {item.date || "2026"}</span>
                                    <span className="mr_30 ml_15"><i className="far fa-folder mr_5" style={{ color: '#0646ac' }}></i> Category: {category?.name || "General"}</span>
                                    <span className="ml_15 mr_15"><i className="far fa-user mr_5" style={{ color: '#0646ac' }}></i> By: Miisky Team</span>
                                </div>
                                <div className="btn-box">
                                    <Link to="/gallery" className="theme-btn btn-two">
                                        <span>Back to Gallery</span>
                                    </Link>
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
