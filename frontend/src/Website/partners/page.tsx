import { useState, useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { getPartners } from "../../utils/api";

export default function PartnersPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
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
                                <div className="partner-block-one" style={{ padding: '30px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fff', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                                    <div className="inner-box" style={{ textAlign: 'center' }}>
                                        <figure className="image-box" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Image src={partner.logo_url || "/website/assets/images/clients/clients-1.png"} alt={partner.name || "Partner Logo"} width={160} height={80} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </figure>
                                        <h5 className="mt_15" style={{ fontSize: '15px', color: '#111', fontWeight: 600 }}>{partner.name}</h5>
                                    </div>
                                    <style dangerouslySetInnerHTML={{ __html: `
                                        .partner-block-one:hover { border-color: #0646ac !important; transform: translateY(-5px); box-shadow: 0 10px 25px rgba(6, 70, 172, 0.1) !important; }
                                    ` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
