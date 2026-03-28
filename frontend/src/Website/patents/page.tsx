import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getPatents } from "../../utils/api";

export default function PatentsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [patents, setPatents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Our Patents");
        const fetchPatentsData = async () => {
            try {
                const response = await getPatents();
                setPatents(Array.isArray(response.data) ? response.data : response.data.results || []);
            } catch (err) {
                console.error("Failed to fetch patents:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatentsData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <section className="patents-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Intellectual Property</span>
                    <h2>Recognized Innovation</h2>
                    <p>Securing our discoveries to ensure the highest quality of healthcare technology across the globe.</p>
                </div>
                {loading ? (
                    <div className="text-center p-5">Loading patents...</div>
                ) : patents.length === 0 ? (
                    <div className="text-center p-5">Our latest patents are currently registered. Please check back soon.</div>
                ) : (
                    <div className="row clearfix">
                        {patents.map((patent) => (
                            <div key={patent.id} className="col-lg-12 col-md-12 col-sm-12 patent-block mb_30">
                                <div className="patent-block-one" style={{ padding: '40px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', borderLeft: '5px solid #0646ac' }}>
                                    <div className="inner-box d-flex flex-wrap align-items-center">
                                        <div className="content-box flex-grow-1">
                                            <div className="patent-meta mb_10" style={{ color: '#0646ac', fontSize: '14px', fontWeight: 700 }}>
                                                <span className="mr_20"><i className="fas fa-certificate"></i> No: {patent.registration_number || "PENDING"}</span>
                                                <span><i className="far fa-calendar-check"></i> Date: {patent.filing_date || "Coming Soon"}</span>
                                            </div>
                                            <h3 className="mb_15" style={{ fontSize: '26px', fontWeight: 700 }}>{patent.title}</h3>
                                            <p className="mb_20" style={{ color: '#555', fontSize: '16px' }}>{patent.abstract || patent.description || "Cutting edge innovation securing our position as leaders in medical technology."}</p>
                                            <div className="status-box d-flex align-items-center justify-content-between">
                                                <span 
                                                    style={{ 
                                                        backgroundColor: patent.status === 'GRANTED' ? '#e1f9eb' : '#fff4e5', 
                                                        color: patent.status === 'GRANTED' ? '#2dcc70' : '#f5821f', 
                                                        padding: '6px 15px', 
                                                        borderRadius: '25px', 
                                                        fontSize: '13px', 
                                                        fontWeight: 700 
                                                    }}
                                                >
                                                    {patent.status || "FILING"}
                                                </span>
                                                <Link to={`/website/patents/${patent.id}`} style={{ color: '#0646ac', fontWeight: 700, fontSize: '14px' }}>
                                                    View Details <i className="fas fa-arrow-right ml_5"></i>
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
