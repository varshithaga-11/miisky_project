import { useState, useEffect } from "react";
import { useLayout } from '@website/context/LayoutContext';
import Image from '@website/components/Image';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { getGalleryItems, getGalleryCategories } from '@/utils/api';

export default function GalleryPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [zoom, setZoom] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Our Gallery");
        const fetchGalleryData = async () => {
            try {
                const [itemsRes, catsRes] = await Promise.all([
                    getGalleryItems(),
                    getGalleryCategories()
                ]);
                const rawItems = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data.results || [];
                const sortedItems = [...rawItems].sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
                setGalleryItems(sortedItems);
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

    // Pagination Logic
    const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handlePageChange = (pageNum: number) => {
        setCurrentPage(pageNum);
        // Using immediate scroll for paginated clicks to feel more responsive
        window.scrollTo({ top: document.getElementById('gallery-top')?.offsetTop || 0, behavior: 'smooth' });
    };

    const handleCategorySelect = (categoryId: number | null) => {
        setFilterCategory(categoryId);
        setCurrentPage(1);
        window.scrollTo({ top: document.getElementById('gallery-top')?.offsetTop || 0, behavior: 'smooth' });
    };

    const openLightbox = (item: any, globalIndex: number) => {
        setSelectedImage(item);
        // Map the current paginated index back to the filtered index for correct navigation
        const actualIndex = (currentPage - 1) * PAGE_SIZE + globalIndex;
        setCurrentIndex(actualIndex);
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
        <section id="gallery-top" className="gallery-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Visuals of Excellence</span>
                    <h2>Our Gallery Showcase</h2>
                    <p>Capturing the essence of modern healthcare through our state-of-the-art facilities and operations.</p>
                </div>

                <div className="filter-box mb_50 centred">
                    <ul className="project-filter clearfix" style={{ display: 'flex', justifyContent: 'center', listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
                        <li 
                            onClick={() => handleCategorySelect(null)} 
                            className={!filterCategory ? "active" : ""} 
                            style={{ cursor: 'pointer', padding: '10px 25px', margin: '5px', borderRadius: '30px', backgroundColor: !filterCategory ? '#0646ac' : '#f0f4ff', color: !filterCategory ? '#fff' : '#0646ac', fontWeight: 600, transition: 'all 0.3s ease' }}
                        >
                            All Projects
                        </li>
                        {categories.map(cat => (
                            <li 
                                key={cat.id} 
                                onClick={() => handleCategorySelect(cat.id)} 
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
                ) : paginatedItems.length === 0 ? (
                    <div className="text-center p-5">No gallery items found for this category.</div>
                ) : (
                    <>
                        <div className="row clearfix">
                            {paginatedItems.map((item, index) => (
                                <div key={item.id} className="col-lg-4 col-md-6 col-sm-12 gallery-block mb_30">
                                    <div 
                                        className="portfolio-block-one" 
                                        onClick={() => openLightbox(item, index)}
                                        style={{ 
                                            cursor: 'pointer', 
                                            marginBottom: '30px'
                                        }}
                                    >
                                        <div className="inner-box" style={{ 
                                            position: 'relative',
                                            height: '350px',
                                            overflow: 'hidden',
                                            borderRadius: '15px'
                                        }}>
                                            <figure className="image-box" style={{ position: 'relative', height: '100%', marginBottom: 0, overflow: 'hidden' }}>
                                                <Image 
                                                    src={item.image_url || "/website/assets/images/project/project-1.jpg"} 
                                                    alt={item.title || "Gallery Image"} 
                                                    width={400} 
                                                    height={350} 
                                                    className="gallery-img-target"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 500ms ease' }} 
                                                />
                                            </figure>
                                            
                                            {/* Replicating the :before overlay effect */}
                                            <div className="overlay-mask" style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(14, 54, 114, 0.8) 68.75%)',
                                                opacity: 0,
                                                transition: 'all 500ms ease',
                                                zIndex: 1
                                            }}></div>

                                            <div className="text-box" style={{
                                                position: 'absolute',
                                                left: '0px',
                                                bottom: '0px',
                                                width: '100%',
                                                padding: '0 50px 0 50px',
                                                zIndex: 2,
                                                opacity: 0,
                                                transition: 'all 500ms ease',
                                                textAlign: 'left'
                                            }}>
                                                <h3 style={{ fontSize: '28px', lineHeight: '38px', fontWeight: 600, marginBottom: '4px', color: '#fff' }}>
                                                    {item.title}
                                                </h3>
                                                <span style={{ fontSize: '16px', color: '#fff', display: 'block' }}>
                                                    {item.description || "View Details"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <style dangerouslySetInnerHTML={{ __html: `
                            .portfolio-block-one:hover .overlay-mask {
                                opacity: 1 !important;
                            }
                            .portfolio-block-one:hover .text-box {
                                opacity: 1 !important;
                                bottom: 45px !important;
                            }
                            .portfolio-block-one:hover .gallery-img-target {
                                transform: scale(1.05) !important;
                            }
                        ` }} />

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="pagination-wrapper centred mt_60">
                                <ul className="pagination flex items-center justify-center gap-3 list-none p-0">
                                    <li>
                                        <button 
                                            onClick={() => { if (currentPage > 1) handlePageChange(currentPage - 1); }}
                                            style={{ 
                                                width: '50px', height: '50px', borderRadius: '15px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: '#fff', border: '1px solid #eee',
                                                color: currentPage === 1 ? '#ccc' : '#111', 
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                            }}
                                            disabled={currentPage === 1}
                                            className="hover-scale"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i+1}>
                                            <button 
                                                onClick={() => handlePageChange(i + 1)}
                                                style={{ 
                                                    width: '50px', height: '50px', borderRadius: '15px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: currentPage === i + 1 ? '#0646ac' : '#fff',
                                                    color: currentPage === i + 1 ? '#fff' : '#111',
                                                    border: currentPage === i + 1 ? 'none' : '1px solid #eee',
                                                    fontWeight: 700,
                                                    fontSize: '16px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: currentPage === i + 1 ? '0 10px 20px rgba(6,70,172,0.2)' : '0 4px 10px rgba(0,0,0,0.03)'
                                                }}
                                                className={currentPage === i + 1 ? "" : "hover-scale"}
                                            >
                                                {(i + 1).toString().padStart(2, '0')}
                                            </button>
                                        </li>
                                    ))}
                                    <li>
                                        <button 
                                            onClick={() => { if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                                            style={{ 
                                                width: '50px', height: '50px', borderRadius: '15px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: '#fff', border: '1px solid #eee',
                                                color: currentPage === totalPages ? '#ccc' : '#111', 
                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                            }}
                                            disabled={currentPage === totalPages}
                                            className="hover-scale"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </li>
                                </ul>
                                <style dangerouslySetInnerHTML={{ __html: `
                                    .hover-scale:hover { transform: translateY(-3px); border-color: #0646ac !important; color: #0646ac !important; }
                                ` }} />
                            </div>
                        )}
                    </>
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

                    {/* Main Container */}
                    <div 
                        className="lightbox-content-wrapper" 
                        style={{ 
                            display: 'flex', flexDirection: 'column', 
                            width: '100%', height: '100%', 
                            justifyContent: 'space-between', alignItems: 'center',
                            padding: '60px 0 20px 0'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Container */}
                        <div 
                            className="lightbox-image-container" 
                            style={{ 
                                flex: 1, width: '100%',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            <img 
                                src={selectedImage.image_url || "/website/assets/images/project/project-1.jpg"} 
                                alt={selectedImage.title || "Gallery Image"} 
                                style={{ 
                                    maxWidth: '90%', maxHeight: '100%', 
                                    transform: `scale(${zoom})`, 
                                    transition: 'transform 0.2s ease-out',
                                    borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                }} 
                            />
                        </div>

                        {/* Info Bar - Guaranteed visibility on dark background */}
                        <div 
                            className="lightbox-info-bar" 
                            style={{ 
                                width: '100%', textAlign: 'center', 
                                color: '#fff', padding: '30px 20px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                            }}
                        >
                            {selectedImage.title && (
                                <h3 style={{ 
                                    margin: '0 0 8px 0', 
                                    fontSize: '32px', 
                                    fontWeight: 800, 
                                    color: '#fff',
                                    letterSpacing: '1px'
                                }}>
                                    {selectedImage.title}
                                </h3>
                            )}
                            {selectedImage.description && (
                                <p style={{ 
                                    margin: '0 0 15px 0', 
                                    fontSize: '20px', 
                                    fontWeight: 500, 
                                    color: '#ccc',
                                    maxWidth: '800px',
                                    marginInline: 'auto'
                                }}>
                                    {selectedImage.description}
                                </p>
                            )}
                            <div 
                                style={{ 
                                    display: 'inline-block',
                                    padding: '5px 15px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#fff',
                                    opacity: 0.7
                                }}
                            >
                                {currentIndex + 1} / {filteredItems.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
