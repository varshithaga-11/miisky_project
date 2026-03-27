import { useState, useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { getGalleryItems, getGalleryCategories } from "../../utils/api";

export default function GalleryPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<number | null>(null);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Our Gallery");
        const fetchGalleryData = async () => {
            try {
                const [itemsRes, catsRes] = await Promise.all([
                    getGalleryItems(),
                    getGalleryCategories()
                ]);
                setGalleryItems(Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data.results || []);
                setCategories(Array.isArray(catsRes.data) ? catsRes.data : catsRes.data.results || []);
            } catch (err) {
                console.error("Failed to fetch gallery data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGalleryData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    const filteredItems = filterCategory 
        ? galleryItems.filter(item => item.category_id === filterCategory) 
        : galleryItems;

    return (
        <section className="gallery-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Visuals of Excellence</span>
                    <h2>Our Gallery Showcase</h2>
                    <p>Capturing the essence of modern healthcare through our state-of-the-art facilities and operations.</p>
                </div>

                <div className="filter-box mb_50 centred">
                    <ul className="project-filter clearfix" style={{ display: 'flex', justifyContent: 'center', listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
                        <li 
                            onClick={() => setFilterCategory(null)} 
                            className={!filterCategory ? "active" : ""} 
                            style={{ cursor: 'pointer', padding: '10px 25px', margin: '5px', borderRadius: '30px', backgroundColor: !filterCategory ? '#0646ac' : '#f0f4ff', color: !filterCategory ? '#fff' : '#0646ac', fontWeight: 600, transition: 'all 0.3s ease' }}
                        >
                            All Projects
                        </li>
                        {categories.map(cat => (
                            <li 
                                key={cat.id} 
                                onClick={() => setFilterCategory(cat.id)} 
                                className={filterCategory === cat.id ? "active" : ""} 
                                style={{ cursor: 'pointer', padding: '10px 25px', margin: '5px', borderRadius: '30px', backgroundColor: filterCategory === cat.id ? '#0646ac' : '#f0f4ff', color: filterCategory === cat.id ? '#fff' : '#0646ac', fontWeight: 600, transition: 'all 0.3s ease' }}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {loading ? (
                    <div className="text-center p-5">Loading gallery...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center p-5">No gallery items found for this category.</div>
                ) : (
                    <div className="row clearfix">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="col-lg-4 col-md-6 col-sm-12 gallery-block mb_30">
                                <div className="gallery-block-one" style={{ position: 'relative', overflow: 'hidden', borderRadius: '15px', height: '350px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
                                    <div className="inner-box" style={{ height: '100%' }}>
                                        <figure className="image-box" style={{ height: '100%', marginBottom: 0 }}>
                                            <Image src={item.image_url || "/website/assets/images/project/project-1.jpg"} alt={item.title} width={400} height={350} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </figure>
                                        <div className="overlay-box" style={{ position: 'absolute', left: 0, bottom: '-100%', width: '100%', padding: '25px', backgroundColor: 'rgba(6, 70, 172, 0.95)', transition: 'all 0.4s ease', display: 'flex', flexDirection: 'column', color: '#fff' }}>
                                            <h4 style={{ color: '#fff', fontSize: '20px', marginBottom: '5px' }}>{item.title}</h4>
                                            <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}>{categories.find(c => c.id === item.category_id)?.name || "Project"}</p>
                                        </div>
                                    </div>
                                    <style dangerouslySetInnerHTML={{ __html: `
                                        .gallery-block-one:hover .overlay-box { bottom: 0 !important; }
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
