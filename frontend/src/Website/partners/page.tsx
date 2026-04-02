import { useState, useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { X, Calendar, Award, Info } from "lucide-react";
import { getPartners } from "../../utils/api";

export default function PartnersPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<any>(null);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Our Trusted Partners");
        const fetchPartnersData = async () => {
            try {
                const response = await getPartners();
                setPartners(Array.isArray(response.data) ? response.data : response.data.results || []);
            } catch (err) {
                console.error("Failed to fetch partner data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPartnersData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <section className="partners-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_60 centred">
                    <span className="sub-title mb_5">Partnership & Collaboration</span>
                    <h2>Collaborating with Leaders</h2>
                    <p>We work with world-class institutions and organizations to deliver groundbreaking healthcare solutions.</p>
                </div>
                {loading ? (
                    <div className="text-center p-5">Loading partner data...</div>
                ) : partners.length === 0 ? (
                    <div className="text-center p-5">We are in the process of finalizing some new partnerships. Please check back later.</div>
                ) : (
                    <div className="row clearfix">
                        {partners.map((partner) => (
                            <div key={partner.id} className="col-lg-3 col-md-4 col-sm-6 partner-block mb_40">
                                <div 
                                    className="partner-card-premium" 
                                    style={{ 
                                        position: 'relative',
                                        padding: '40px 30px', 
                                        borderRadius: '24px', 
                                        backgroundColor: '#fff', 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)', 
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                                        border: '1px solid rgba(0,0,0,0.03)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div className="inner-box centred" style={{ width: '100%' }}>
                                        <figure className="image-box mb_25" style={{ 
                                            height: '140px', 
                                            width: '100%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            transition: '0.3s',
                                            backgroundColor: '#fff',
                                            borderRadius: '20px',
                                            padding: '8px',
                                            border: '1px solid rgba(0,0,0,0.06)'
                                        }}>
                                            <Image 
                                                src={partner.logo_url || "/website/assets/images/clients/clients-1.png"} 
                                                alt={partner.name} 
                                                width={250} 
                                                height={140} 
                                                style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} 
                                            />
                                        </figure>
                                        <h5 style={{ fontSize: '18px', color: '#111', fontWeight: 700, marginBottom: '6px' }}>{partner.name}</h5>
                                        {partner.since_year && (
                                            <span style={{ fontSize: '13px', color: '#888', fontWeight: 500, display: 'block', marginBottom: '20px' }}>
                                                Partner since {partner.since_year}
                                            </span>
                                        )}
                                    </div>

                                    <div className="btn-box mt_10">
                                        <button 
                                            onClick={() => setSelectedPartner(partner)} 
                                            className="theme-btn" 
                                            style={{ 
                                                padding: '10px 30px', borderRadius: '50px',
                                                backgroundColor: '#0646ac', color: '#fff',
                                                fontSize: '14px', fontWeight: 600,
                                                border: 'none', cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 10px 20px rgba(6,70,172,0.15)'
                                            }}
                                        >
                                            View Profile
                                        </button>
                                    </div>

                                    {/* Decorative Accent */}
                                    <div style={{ 
                                        position: 'absolute', bottom: 0, left: 0, width: '100%', 
                                        height: '4px', backgroundColor: '#0646ac', transform: 'scaleX(0)',
                                        transition: 'transform 0.4s ease', transformOrigin: 'left'
                                    }} className="card-accent" />

                                    <style dangerouslySetInnerHTML={{ __html: `
                                        .partner-card-premium:hover { transform: translateY(-10px); boxShadow: 0 30px 60px rgba(6,70,172,0.15) !important; border-color: rgba(6,70,172,0.1) !important; }
                                        .partner-card-premium:hover .card-accent { transform: scaleX(1); }
                                        .partner-card-premium:hover figure { transform: scale(1.05); }
                                        .partner-card-premium .theme-btn:hover { background-color: #111; transform: scale(1.05); }
                                    ` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Partner Detail Modal */}
            {selectedPartner && (
                <div 
                    className="modal-overlay" 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                        backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, 
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backdropFilter: 'blur(5px)', padding: '20px'
                    }}
                    onClick={() => setSelectedPartner(null)}
                >
                    <div 
                        className="modal-content" 
                        style={{ 
                            backgroundColor: '#fff', maxWidth: '800px', width: '100%', 
                            borderRadius: '20px', overflow: 'hidden', position: 'relative',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                            animation: 'modalSlideUp 0.4s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedPartner(null)} 
                            style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f0f4ff', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#0646ac', zIndex: 10 }}
                        >
                            <X size={24} />
                        </button>

                        <div className="row g-0">
                            <div className="col-md-5" style={{ backgroundColor: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <figure style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                        <Image src={selectedPartner.logo_url || "/website/assets/images/clients/clients-1.png"} alt={selectedPartner.name} width={200} height={120} style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
                                    </figure>
                                    <span style={{ display: 'inline-block', padding: '5px 15px', backgroundColor: '#eef3ff', color: '#0646ac', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {selectedPartner.partner_type?.replace('_', ' ') || 'Partner'}
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-7" style={{ padding: '40px' }}>
                                <h2 style={{ fontSize: '28px', color: '#111', marginBottom: '10px' }}>{selectedPartner.name}</h2>
                                {selectedPartner.since_year && (
                                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={16} color="#0646ac" /> Partner since {selectedPartner.since_year}
                                    </p>
                                )}
                                
                                <div className="detail-section mb_20">
                                    <h6 style={{ fontWeight: 700, color: '#0646ac', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Info size={18} /> About Partner
                                    </h6>
                                    <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#444' }}>
                                        {selectedPartner.description || "Leading organization collaborating toward innovative healthcare excellence."}
                                    </p>
                                </div>

                                {selectedPartner.collaboration_details && (
                                    <div className="detail-section mb_30">
                                        <h6 style={{ fontWeight: 700, color: '#0646ac', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Award size={18} /> Collaboration Scope
                                        </h6>
                                        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#444' }}>
                                            {selectedPartner.collaboration_details}
                                        </p>
                                    </div>
                                )}

                                <div className="modal-footer-btns" style={{ borderTop: '1px solid #eee', paddingTop: '25px', display: 'flex', gap: '15px' }}>
                                    {selectedPartner.website_url && (
                                        <a href={selectedPartner.website_url.startsWith('http') ? selectedPartner.website_url : `https://${selectedPartner.website_url}`} target="_blank" rel="noopener noreferrer" className="theme-btn btn-one" style={{ padding: '10px 25px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>Visit Website</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            ` }} />
        </section>
    );
}
