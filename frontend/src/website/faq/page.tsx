import { useState, useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import { getFAQs, getFAQCategories } from "../../utils/api";

export default function FAQPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [faqs, setFaqs] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<number | null>(null);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Frequently Asked Questions");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    // Fetch categories initially
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getFAQCategories();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setCategories(data);
                // Optionally select the first category by default
                // if (data.length > 0) setSelectedCategory(data[0].id);
            } catch (err) {
                console.error("Failed to fetch FAQ categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch FAQs whenever category changes
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setLoading(true);
                const params = selectedCategory ? { category: selectedCategory } : {};
                const response = await getFAQs(params);
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setFaqs(data);
                if (data.length > 0) setActiveId(data[0].id);
                else setActiveId(null);
            } catch (err) {
                console.error("Failed to fetch FAQs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, [selectedCategory]);

    const toggleAccordion = (id: number) => {
        setActiveId(activeId === id ? null : id);
    };

    return (
        <div className="faq-page pb_120">
            <section className="faq-section p_relative pt_120">
                <div className="auto-container">
                    <div className="sec-title mb_50 centred">
                        <span className="sub-title mb_5">Any Questions?</span>
                        <h2>Commonly Asked Questions</h2>
                        <p>Find answers to the most common questions about our services and policies.</p>
                    </div>

                    <div className="row clearfix">
                        {/* Sidebar Column for Categories */}
                        <div className="col-lg-4 col-md-12 col-sm-12 sidebar-column">
                            <div className="faq-sidebar p_relative d_block mr_20 mt_30">
                                <div className="category-widget p-4" style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #eee', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
                                    <h3 className="mb_20" style={{ fontSize: '20px', fontWeight: 800 }}>Categories</h3>
                                    <ul className="category-list" style={{ listStyle: 'none', padding: 0 }}>
                                        <li className="mb_10">
                                            <button 
                                                onClick={() => setSelectedCategory(null)}
                                                className="w-full text-left transition-all duration-300"
                                                style={{ 
                                                    padding: '12px 20px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '16px', 
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    backgroundColor: selectedCategory === null ? '#0646ac' : 'transparent',
                                                    color: selectedCategory === null ? '#fff' : '#555',
                                                    border: 'none'
                                                }}
                                            >
                                                <span>All Questions</span>
                                                <i className="fas fa-chevron-right" style={{ fontSize: '12px', opacity: selectedCategory === null ? 1 : 0.3 }}></i>
                                            </button>
                                        </li>
                                        {categories.map((cat) => (
                                            <li key={cat.id} className="mb_10">
                                                <button 
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className="w-full text-left transition-all duration-300"
                                                    style={{ 
                                                        padding: '12px 20px', 
                                                        borderRadius: '12px', 
                                                        fontSize: '16px', 
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        backgroundColor: selectedCategory === cat.id ? '#0646ac' : 'transparent',
                                                        color: selectedCategory === cat.id ? '#fff' : '#555',
                                                        border: 'none'
                                                    }}
                                                >
                                                    <span>{cat.name}</span>
                                                    <i className="fas fa-chevron-right" style={{ fontSize: '12px', opacity: selectedCategory === cat.id ? 1 : 0.3 }}></i>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt_30 p-4 text-center d-none d-lg-block" style={{ backgroundColor: '#f0f4ff', borderRadius: '20px' }}>
                                    <h4 className="mb_10" style={{ fontWeight: 800 }}>Still have questions?</h4>
                                    <p className="mb_20" style={{ fontSize: '14px', color: '#666' }}>Can't find the answer you're looking for? Please chat to our friendly team.</p>
                                    <button onClick={() => window.location.href='/contact'} className="theme-btn btn-one w-full">Contact Us</button>
                                </div>
                            </div>
                        </div>

                        {/* Content Column for FAQs */}
                        <div className="col-lg-8 col-md-12 col-sm-12 content-column">
                            <div className="content_block_faq mt_30">
                                {loading ? (
                                    <div className="text-center p-5">Loading questions...</div>
                                ) : faqs.length === 0 ? (
                                    <div className="text-center p-5" style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '100px !important', border: '1px solid #eee' }}>
                                        <i className="fas fa-search mb_20" style={{ fontSize: '40px', color: '#eee' }}></i>
                                        <p style={{ fontSize: '18px', color: '#888' }}>No FAQs found in this category.</p>
                                    </div>
                                ) : (
                                    <ul className="accordion-box">
                                        {faqs.map((faq) => (
                                            <li key={faq.id} className={`accordion ${activeId === faq.id ? "active-block" : ""}`}>
                                                <div 
                                                    className={`acc-btn ${activeId === faq.id ? "active" : ""}`} 
                                                    onClick={() => toggleAccordion(faq.id)}
                                                    style={{ 
                                                        cursor: 'pointer', 
                                                        padding: '25px 30px', 
                                                        backgroundColor: activeId === faq.id ? '#fff' : '#fcfcfc', 
                                                        border: '1px solid #eee', 
                                                        marginBottom: '15px', 
                                                        borderRadius: activeId === faq.id ? '15px 15px 0 0' : '15px', 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: activeId === faq.id ? '0 10px 25px rgba(0,0,0,0.05)' : 'none'
                                                    }}
                                                >
                                                    <h5 style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>{faq.question}</h5>
                                                    <div className={`icon-box ${activeId === faq.id ? "rotate-180" : ""} transition-transform duration-300`} style={{ color: activeId === faq.id ? '#0646ac' : '#999' }}>
                                                        <i className={`fas ${activeId === faq.id ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                                                    </div>
                                                </div>
                                                <div className="acc-content" style={{ display: activeId === faq.id ? "block" : "none", padding: '25px 30px 40px 30px', border: '1px solid #eee', marginTop: '-20px', marginBottom: '15px', borderTop: 'none', backgroundColor: '#fff', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px', boxShadow: '0 15px 25px rgba(0,0,0,0.05)' }}>
                                                    <div className="text text-left">
                                                        <p style={{ color: '#555', lineHeight: '1.8', fontSize: '16px' }}>{faq.answer}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            {/* Mobile version of Still have questions */}
                            <div className="mt_40 mb_40 p-4 text-center d-block d-lg-none" style={{ backgroundColor: '#f0f4ff', borderRadius: '20px' }}>
                                <h4 className="mb_10" style={{ fontWeight: 800 }}>Still have questions?</h4>
                                <p className="mb_20" style={{ fontSize: '14px', color: '#666' }}>Can't find the answer you're looking for? Please chat to our friendly team.</p>
                                <button onClick={() => window.location.href='/contact'} className="theme-btn btn-one w-full">Contact Us</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

