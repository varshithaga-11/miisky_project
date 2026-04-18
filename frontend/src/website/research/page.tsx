import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import { getResearchPapers } from '@/utils/api';

export default function InnovationPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Innovation & Research");
        const fetchPapersData = async () => {
            try {
                setLoading(true);
                const response = await getResearchPapers();
                const rawData = Array.isArray(response.data) ? response.data : response.data.results || [];
                setPapers(rawData);
                setTotalPages(Math.ceil(rawData.length / PAGE_SIZE) || 1);
            } catch (err) {
                console.error("Failed to fetch research paper data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPapersData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    const displayedPapers = papers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
                    <>
                        <div className="row clearfix">
                            {displayedPapers.map((paper) => (
                                <div key={paper.id} className="col-lg-6 col-md-6 col-sm-12 paper-block mb_30">
                                    <div className="paper-block-one hover-pop" style={{ padding: '30px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 5px 25px rgba(0,0,0,0.05)', height: '100%' }}>
                                        <div className="inner-box d-flex flex-wrap align-items-start">
                                            <div className="content-box flex-grow-1">
                                                <div className="paper-meta mb_10" style={{ color: '#777', fontSize: '14px' }}>
                                                    <span className="mr_20"><i className="far fa-calendar-alt"></i> {paper.published_date || "Coming Soon"}</span>
                                                    <span><i className="far fa-user"></i> {paper.authors || "Miisky Team"}</span>
                                                </div>
                                                <h3 className="mb_15" style={{ fontSize: '20px', fontWeight: 700, lineHeight: '1.4' }}>{paper.title}</h3>
                                                <p className="mb_20" style={{ color: '#555', fontSize: '15px' }}>{paper.abstract ? paper.abstract.substring(0, 150) + "..." : "Cutting edge research findings from our dedicated innovation team."}</p>
                                                <div className="btn-box">
                                                    <Link to={`/research/${paper.uid || paper.id}`} className="theme-btn btn-one" style={{ padding: '8px 25px' }}>
                                                        <span>View Details</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
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
