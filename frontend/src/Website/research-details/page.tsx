import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getResearchPaperById } from "../../utils/api";
import Cta from "../components/sections/home2/Cta";

export default function ResearchPaperDetailsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { id } = useParams<{ id: string }>();
    const [paper, setPaper] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Research Details");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchPaperData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await getResearchPaperById(parseInt(id));
                setPaper(response.data);
            } catch (err) {
                console.error("Failed to fetch research paper details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPaperData();
    }, [id]);

    if (loading) return <div className="text-center p-5 mt_100">Loading research paper details...</div>;
    if (!paper) return <div className="text-center p-5 mt_100">Research paper not found. <Link to="/research">Go back</Link></div>;

    return (
        <div className="research-paper-details-page">
            <section className="research-details-section p_relative sec-pad-2">
                <div className="auto-container">
                    <div className="row clearfix">
                        <div className="col-lg-12 col-md-12 col-sm-12 content-column">
                            <div className="content-box p_relative d_block" style={{ padding: '60px', border: '1px solid #eee', borderRadius: '20px', backgroundColor: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                                <div className="paper-meta mb_25" style={{ color: '#777', fontSize: '15px' }}>
                                    <span className="mr_30"><i className="far fa-calendar-alt" style={{ color: '#0646ac', marginRight: '5px' }}></i> {paper.published_date || "Coming Soon"}</span>
                                    <span className="mr_30"><i className="far fa-user" style={{ color: '#0646ac', marginRight: '5px' }}></i> {paper.author || "Miisky Team"}</span>
                                </div>
                                <h1 className="mb_40" style={{ fontSize: '36px', fontWeight: 800, color: '#111', lineHeight: '1.3' }}>{paper.title}</h1>
                                
                                <div className="abstract-box mb_50 p-4" style={{ backgroundColor: '#f0f4ff', borderRadius: '15px', borderLeft: '5px solid #0646ac' }}>
                                    <h3 className="mb_15" style={{ fontSize: '22px', fontWeight: 700 }}>Abstract</h3>
                                    <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#444', fontStyle: 'italic' }}>
                                        {paper.abstract || "Detailed scientific research finding to improve clinical outcomes and medical technology."}
                                    </p>
                                </div>
                                
                                <div className="full-content mb_60">
                                    <h3 className="mb_20" style={{ fontSize: '24px', fontWeight: 700 }}>Introduction & Methodology</h3>
                                    <p style={{ fontSize: '17px', lineHeight: '1.9', color: '#555', marginBottom: '30px' }}>
                                        {paper.long_content || "Our research focuses on providing innovative solutions to the world's most pressing medical challenges. Using data-driven methodologies and clinical trials, we aim to provide reliable findings for the medical community. This paper outlines our process, discoveries, and potential for future developments within the healthcare field."}
                                    </p>
                                    
                                    <div className="row clearfix mt_40 mb_40" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee' }}>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <h4 style={{ fontWeight: 700, marginBottom: '15px' }}>Key Findings</h4>
                                            <ul style={{ listStyle: 'circle', paddingLeft: '20px' }}>
                                                <li>Reduced recovery time by up to 25%</li>
                                                <li>Improved diagnostic accuracy</li>
                                                <li>Enhanced patient care management</li>
                                            </ul>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <h4 style={{ fontWeight: 700, marginBottom: '15px' }}>References</h4>
                                            <p style={{ fontSize: '14px', color: '#888' }}>
                                                Detailed list of references available in the full PDF document. 
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="btn-box d-flex align-items-center">
                                    <a href={paper.document_url || "#"} target="_blank" rel="noopener noreferrer" className="theme-btn btn-one mr_20">
                                        <span>Download Full PDF</span>
                                    </a>
                                    <Link to="/research" className="theme-btn btn-two" style={{ backgroundColor: 'transparent', border: '1.5px solid #eee', color: '#777' }}>
                                        <span>Back to Research</span>
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
