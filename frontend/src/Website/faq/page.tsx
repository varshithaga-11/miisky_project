import { useState, useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import { getFAQs } from "../../utils/api";

export default function FAQPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<number | null>(null);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Frequently Asked Questions");
        const fetchFaqs = async () => {
            try {
                const response = await getFAQs();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setFaqs(data);
                if (data.length > 0) setActiveId(data[0].id);
            } catch (err) {
                console.error("Failed to fetch FAQs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    const toggleAccordion = (id: number) => {
        setActiveId(activeId === id ? null : id);
    };

    return (
        <section className="faq-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="row clearfix">
                    <div className="col-lg-12 col-md-12 col-sm-12 content-column">
                        <div className="content_block_faq">
                            <div className="sec-title mb_50 centred">
                                <span className="sub-title mb_5">Any Questions?</span>
                                <h2>Commonly Asked Questions</h2>
                                <p>Find answers to the most common questions about our services and policies.</p>
                            </div>
                            {loading ? (
                                <div className="text-center p-5">Loading questions...</div>
                            ) : faqs.length === 0 ? (
                                <div className="text-center p-5">No FAQs found.</div>
                            ) : (
                                <ul className="accordion-box mt_30">
                                    {faqs.map((faq) => (
                                        <li key={faq.id} className={`accordion ${activeId === faq.id ? "active-block" : ""}`}>
                                            <div 
                                                className={`acc-btn ${activeId === faq.id ? "active" : ""}`} 
                                                onClick={() => toggleAccordion(faq.id)}
                                                style={{ cursor: 'pointer', padding: '20px 30px', backgroundColor: '#f8f9fa', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            >
                                                <h5 style={{ margin: 0 }}>{faq.question}</h5>
                                                <i className={`fas ${activeId === faq.id ? "fa-minus" : "fa-plus"}`}></i>
                                            </div>
                                            <div className="acc-content" style={{ display: activeId === faq.id ? "block" : "none", padding: '20px 30px', border: '1px solid #eee', marginTop: '-11px', marginBottom: '10px', borderTop: 'none', backgroundColor: '#fff' }}>
                                                <div className="text">
                                                    <p>{faq.answer}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
