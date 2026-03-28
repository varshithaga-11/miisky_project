import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getResearchPapers } from "../../utils/api";

export default function InnovationPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Innovation & Research");
        const fetchPapersData = async () => {
            try {
                const response = await getResearchPapers();
                setPapers(Array.isArray(response.data) ? response.data : response.data.results || []);
            } catch (err) {
                console.error("Failed to fetch research paper data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPapersData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <section className="innovation-research-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Pushing the boundaries</span>
                    <h2>Our Research Papers</h2>
                    <p>Sharing our findings with the medical community to improve healthcare globally.</p>
                </div>
                {loading ? (
                    <div className="text-center p-5">Loading research papers...</div>
                ) : papers.length === 0 ? (
                    <div className="text-center p-5">Our latest publications are currently being processed. Please check back soon.</div>
                ) : (
                    <div className="row clearfix">
                        {papers.map((paper) => (
                            <div key={paper.id} className="col-lg-12 col-md-12 col-sm-12 paper-block mb_30">
                                <div className="paper-block-one" style={{ padding: '40px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                                    <div className="inner-box d-flex flex-wrap align-items-center">
                                        <div className="icon-box mr_40 mb_mobile_20" style={{ width: '80px', height: '110px', backgroundColor: '#f0f4ff', color: '#0646ac', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '40px', overflow: 'hidden' }}>
                                            <i className="far fa-file-pdf"></i>
                                        </div>
                                        <div className="content-box flex-grow-1">
                                            <div className="paper-meta mb_10" style={{ color: '#777', fontSize: '14px' }}>
                                                <span className="mr_20"><i className="far fa-calendar-alt"></i> {paper.published_date || "Coming Soon"}</span>
                                                <span><i className="far fa-user"></i> {paper.author || "Miisky Team"}</span>
                                            </div>
                                            <h3 className="mb_15" style={{ fontSize: '24px', fontWeight: 700 }}>{paper.title}</h3>
                                            <p className="mb_20" style={{ color: '#555', fontSize: '16px' }}>{paper.abstract ? paper.abstract.substring(0, 200) + "..." : "Cutting edge research findings from our dedicated innovation team."}</p>
                                            <div className="btn-box">
                                                <Link to={`/website/research/${paper.id}`} className="theme-btn btn-one" style={{ padding: '8px 25px' }}>
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
