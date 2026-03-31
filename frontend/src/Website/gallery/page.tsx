import { useState, useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { getGalleryItems, getGalleryCategories } from "../../utils/api";

export default function GalleryPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [zoom, setZoom] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setHeaderStyle(1);
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
        ? galleryItems.filter(item => String(item.category) === String(filterCategory)) 
        : galleryItems;

    const openLightbox = (item: any, index: number) => {
        setSelectedImage(item);
        setCurrentIndex(index);
        setZoom(1);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto';
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % filteredItems.length;
        setSelectedImage(filteredItems[nextIndex]);
        setCurrentIndex(nextIndex);
        setZoom(1);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        setSelectedImage(filteredItems[prevIndex]);
        setCurrentIndex(prevIndex);
        setZoom(1);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

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
                        {filteredItems.map((item, index) => (
                            <div key={item.id} className="col-lg-4 col-md-6 col-sm-12 gallery-block mb_30">
                                <div 
                                    className="gallery-block-one" 
                                    onClick={() => openLightbox(item, index)}
                                    style={{ 
                                        position: 'relative', 
                                        borderRadius: '15px', 
                                        cursor: 'pointer', 
                                        transition: 'all 0.3s ease', 
                                        backgroundColor: '#fff',
                                        overflow: 'hidden',
                                        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                                        height: '350px'
                                    }}
                                >
                                    <div className="inner-box" style={{ height: '100%', display: 'block' }}>
                                        <figure className="image-box" style={{ height: '100%', marginBottom: 0, overflow: 'hidden' }}>
                                            <Image 
                                                src={item.image_url || "/website/assets/images/project/project-1.jpg"} 
                                                alt={item.title} 
                                                width={400} 
                                                height={350} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                                            />
                                        </figure>
                                    </div>
                                    <style dangerouslySetInnerHTML={{ __html: `
                                        .gallery-block-one:hover img { transform: scale(1.05); }
                                    ` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Lightbox */}
            {selectedImage && (
                <div 
                    className="lightbox-overlay" 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                        backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, 
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                    onClick={closeLightbox}
                >
                    {/* Controls Bar */}
                    <div 
                        className="lightbox-controls" 
                        style={{ position: 'absolute', top: '20px', right: '30px', display: 'flex', gap: '20px', zIndex: 10000 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={handleZoomIn} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }} title="Zoom In"><ZoomIn size={28} /></button>
                        <button onClick={handleResetZoom} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }} title="Reset"><RotateCcw size={28} /></button>
                        <button onClick={handleZoomOut} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }} title="Zoom Out"><ZoomOut size={28} /></button>
                        <button onClick={closeLightbox} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '20px' }} title="Close"><X size={32} /></button>
                    </div>

                    {/* Navigation Buttons */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
                        style={{ position: 'absolute', left: '30px', color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.3s' }}
                    >
                        <ChevronLeft size={36} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                        style={{ position: 'absolute', right: '30px', color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.3s' }}
                    >
                        <ChevronRight size={36} />
                    </button>

                    {/* Image Container */}
                    <div 
                        className="lightbox-image-container" 
                        style={{ 
                            maxWidth: '90%', maxHeight: '90%', 
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            overflow: 'hidden', transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedImage.image_url || "/website/assets/images/project/project-1.jpg"} 
                            alt={selectedImage.title} 
                            style={{ 
                                maxWidth: '100%', maxHeight: '80vh', 
                                transform: `scale(${zoom})`, 
                                transition: 'transform 0.2s ease-out',
                                borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }} 
                        />
                    </div>

                    {/* Info Bar */}
                    <div 
                        className="lightbox-info" 
                        style={{ position: 'absolute', bottom: '40px', textAlign: 'center', color: '#fff' }}
                    >
                        <h3 style={{ color: '#fff', marginBottom: '5px' }}>{selectedImage.title}</h3>
                        <p style={{ margin: 0, opacity: 0.8 }}>{currentIndex + 1} of {filteredItems.length}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
