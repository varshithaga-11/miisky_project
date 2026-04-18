import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getPartnerById } from "../../utils/api";
import Image from "../components/Image";
import Cta from "../components/sections/home2/Cta";

export default function PartnerDetailsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { uid } = useParams<{ uid: string }>();
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Partner Details");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchPartnerData = async () => {
            if (!uid) return;
            try {
                setLoading(true);
                const response = await getPartnerById(uid);
                setPartner(response.data);
            } catch (err) {
                console.error("Failed to fetch partner details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPartnerData();
    }, [uid]);

    if (loading) return <div className="text-center p-5 mt_100">Loading partner details...</div>;
    if (!partner) return <div className="text-center p-5 mt_100">Partner not found. <Link to="/partners">Go back</Link></div>;

    return (
        <div className="partner-details-page">
            <section className="partner-details-section p_relative sec-pad-2">
                <div className="auto-container">
                    <div className="row clearfix">
                        <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                            <div className="image-box p_relative d_block mr_40 text-center" style={{ backgroundColor: '#fff', padding: '60px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1.5px solid #f0f4ff' }}>
                                <Image 
                                    src={partner.logo_url || "/website/assets/images/clients/clients-logo-1.png"} 
                                    alt={partner.name} 
                                    width={300} 
                                    height={150}
                                    style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }}
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                            <div className="content-box p_relative d_block">
                                <div className="sec-title mb_25">
                                    <span className="sub-title mb_5">Trusted Partner</span>
                                    <h2>{partner.name}</h2>
                                </div>
                                <div className="text mb_30">
                                    <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#555' }}>
                                        {partner.description || "As a long-standing partner, we collaborate with them to achieve shared goals in the healthcare industry. Their contribution to our ecosystem is highly valued, and we continue to find innovative ways to serve the community together."}
                                    </p>
                                </div>
                                <div className="partner-info-box mb_40">
                                    <ul className="list-item clearfix" style={{ paddingLeft: '0', listStyle: 'none' }}>
                                        <li className="mb_15 pb_10" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ fontWeight: 700, marginRight: '10px', color: '#0646ac' }}>Relationship:</span>
                                            <span>Strategic Partner</span>
                                        </li>
                                        <li className="mb_15 pb_10" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ fontWeight: 700, marginRight: '10px', color: '#0646ac' }}>Duration:</span>
                                            <span>Since 2021</span>
                                        </li>
                                        <li className="mb_15 pb_10" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ fontWeight: 700, marginRight: '10px', color: '#0646ac' }}>Sector:</span>
                                            <span>Technology & Healthcare</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="btn-box">
                                    <a href={partner.website_url || "/contact"} target="_blank" rel="noopener noreferrer" className="theme-btn btn-one" style={{ padding: '12px 35px' }}>
                                        <span>Visit Partner Website</span>
                                    </a>
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
