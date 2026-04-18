import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import { getPatentById } from '@/utils/api';
import Cta from '@website/components/sections/home2/Cta';

export default function PatentDetailsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { uid } = useParams<{ uid: string }>();
    const [patent, setPatent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Patent Details");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchPatentData = async () => {
            if (!uid) return;
            try {
                setLoading(true);
                const response = await getPatentById(uid);
                setPatent(response.data);
            } catch (err) {
                console.error("Failed to fetch patent details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatentData();
    }, [uid]);

    if (loading) return <div className="text-center p-5 mt_100">Loading patent details...</div>;
    if (!patent) return <div className="text-center p-5 mt_100">Patent not found. <Link to="/patents">Go back</Link></div>;

    return (
        <div className="patent-details-page">
            <section className="patent-details-section p_relative sec-pad-2">
                <div className="auto-container">
                    <div className="row clearfix">
                        <div className="col-lg-12 col-md-12 col-sm-12 content-column">
                            <div className="content-box p_relative d_block" style={{ padding: '30px', border: '1px solid #eee', borderRadius: '30px', backgroundColor: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.06)', borderLeft: '10px solid #0646ac' }}>
                                <div className="patent-meta mb_25 d-flex align-items-center flex-wrap" style={{ color: '#777', fontSize: '15px' }}>
                                    <span className="mr_40 p-2" style={{ backgroundColor: '#f0f4ff', borderRadius: '10px', color: '#0646ac', fontWeight: 700 }}>
                                        <i className="fas fa-certificate mr_5"></i> No: {patent.patent_number || patent.application_number || "PENDING"}
                                    </span>
                                    <span className="mr_40"><i className="far fa-calendar-check mr_5" style={{ color: '#0646ac' }}></i> Filed: {patent.filing_date || "Coming Soon"}</span>
                                    <span style={{ 
                                        backgroundColor: patent.status === 'GRANTED' ? '#e1f9eb' : '#fff4e5', 
                                        color: patent.status === 'GRANTED' ? '#2dcc70' : '#f5821f', 
                                        padding: '6px 20px', 
                                        borderRadius: '30px', 
                                        fontSize: '14px', 
                                        fontWeight: 800 
                                    }}>
                                        {patent.status || "FILING"}
                                    </span>
                                </div>
                                <h1 className="mb_40" style={{ fontSize: '30px', fontWeight: 900, color: '#111', lineHeight: '1.2' }}>{patent.title}</h1>
                                
                                <div className="description-box mb_50">
                                    <h3 className="mb_20" style={{ fontSize: '24px', fontWeight: 700 }}>Innovation Summary</h3>
                                    <p style={{ fontSize: '18px', lineHeight: '1.9', color: '#555', marginBottom: '30px' }}>
                                        {patent.innovation_summary || patent.abstract || "Leading-edge medical device technology and clinical procedures meant to elevate the quality of life for patients globally. Our patents ensure that our intellectual property stays secure and provides unique value to our healthcare partners."}
                                    </p>
                                    
                                    <div className="detailed-tech p-4" style={{ backgroundColor: '#fdfdfd', borderRadius: '15px', border: '1px dashed #eee' }}>
                                        <h4 className="mb_15" style={{ fontWeight: 700 }}>Technical Specifications</h4>
                                        <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.7' }}>
                                            {patent.technical_specifications || "A novel approach involving biometric feedback loops and advanced machine learning models integrated within a portable healthcare solution. Designed to maximize diagnostic precision while minimizing patient discomfort during lengthy clinical observations."}
                                        </p>
                                    </div>
                                </div>

                                <div className="btn-box d-flex align-items-center flex-column flex-sm-row mt_40" style={{ gap: '15px' }}>
                                    <Link to="/contact" className="theme-btn btn-one mr_20" style={{ whiteSpace: 'nowrap'}}>
                                        <span>Inquire about licensing</span>
                                    </Link>
                                    <Link to="/patents" className="theme-btn btn-two" style={{ backgroundColor: 'transparent', border: '1.5px solid #eee', color: '#888', whiteSpace: 'nowrap' }}>
                                        <span>Back to Patents</span>
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
