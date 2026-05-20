import { useEffect, useState } from "react";
import { useLayout } from '@website/context/LayoutContext';
import ContactForm from "../components/elements/ContactForm";
import Image from '@website/components/Image';
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import GoogleMapSection from "../components/sections/home1/GoogleMap";
import { getContactUsInfoList } from "../utils/api";
import { ContactUsInfo } from "../utils/types";

export default function ContactPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [contacts, setContacts] = useState<ContactUsInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Contact Us");
        
        const fetchContacts = async () => {
            try {
                const res = await getContactUsInfoList();
                setContacts(res.results || []);
            } catch (err) {
                console.error("Failed to fetch contact details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    const activeContacts = contacts.length > 0 ? contacts : [{
        address: "#211, Temple Street, 9th Main Road, BEML III Stage, Rajarajeswarinagar, Bengaluru, Karnataka 560098",
        email_support: "support@miisky.com",
        email_general: "g.jagan@aarmsvaluechain.com",
        phone_primary: "+91 9845497950",
        phone_secondary: undefined,
        google_maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15555.200144414943!2d77.49867088715823!3d12.92057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3e556c40033f%3A0x63047169f2577e88!2sAARMS%20Value%20Chain%20Private%20Limited!5e0!3m2!1sen!2sin!4v1743398075591!5m2!1sen!2sin"
    }];

    useEffect(() => {
        if (activeIdx >= activeContacts.length) {
            setActiveIdx(0);
        }
    }, [activeContacts.length, activeIdx]);

    const contact = activeContacts[activeIdx] || activeContacts[0];
    const formattedCountry = contact.country ? contact.country.charAt(0).toUpperCase() + contact.country.slice(1) : "";
    const officeTitle = contact.city ? `${contact.city} Office (${formattedCountry})` : `${formattedCountry} Office`;

    const fadeStyle = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `;

    return (
        <div className="boxed_wrapper">
            <style dangerouslySetInnerHTML={{ __html: fadeStyle }} />
            
            {activeContacts.length > 1 && (
                <section className="location-tabs-section" style={{ padding: '60px 0 20px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div className="auto-container">
                        <div className="sec-title centred" style={{ marginBottom: '35px' }}>
                            <span className="sub-title" style={{ color: '#0646ac', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Global Ecosystem</span>
                            <h2 style={{ fontSize: '36px', fontWeight: '800' }}>Select Office Location</h2>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: '15px',
                            marginBottom: '10px'
                        }}>
                            {activeContacts.map((item, idx) => {
                                const city = item.city || "Office";
                                const country = item.country ? item.country.charAt(0).toUpperCase() + item.country.slice(1) : "";
                                const isSelected = idx === activeIdx;

                                return (
                                    <button
                                        key={item.uid || idx}
                                        onClick={() => setActiveIdx(idx)}
                                        style={{
                                            padding: '14px 30px',
                                            borderRadius: '50px',
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            border: 'none',
                                            background: isSelected 
                                                ? 'linear-gradient(135deg, #0646ac 0%, #1e70e9 100%)' 
                                                : '#ffffff',
                                            color: isSelected ? '#ffffff' : '#334155',
                                            cursor: 'pointer',
                                            boxShadow: isSelected 
                                                ? '0 10px 25px rgba(6, 70, 172, 0.25)' 
                                                : '0 4px 6px rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#f1f5f9';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#ffffff';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {city}, {country}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <div key={contact.uid || activeIdx} className="animate-fade-in">
                <div className="sec-title centred" style={{ marginTop: '50px', marginBottom: '10px' }}>
                    <span className="sub-title">Office Details</span>
                    <h2>{officeTitle}</h2>
                </div>

                <section className="contact-info-two centred" style={{ padding: '40px 0 40px 0', background: 'none' }}>
                    <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-43.png)" }}></div>
                    <div className="auto-container">
                        <div className="row clearfix" style={{ display: 'flex', flexWrap: 'wrap', rowGap: '40px' }}>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms" style={{ height: '100%', marginTop: '30px' }}>
                                    <div className="inner-box" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '55px 15px 15px 15px' }}>
                                        <div className="icon-box"><Image src="/website/assets/images/icons/icon-23.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3 style={{ marginBottom: '10px' }}>Office Location</h3>
                                        <p style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: '1.6', marginBottom: '10px' }}>
                                            {contact.address || ""}
                                            {contact.city && `, ${contact.city}`}
                                            {contact.state && `, ${contact.state}`}
                                            {contact.country && `, ${contact.country}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="200ms" data-wow-duration="1500ms" style={{ height: '100%', marginTop: '30px' }}>
                                    <div className="inner-box" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '55px 15px 0px 15px' }}>
                                        <div className="icon-box"><Image src="/website/assets/images/icons/icon-24.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3 style={{ marginBottom: '5px' }}>Company Email</h3>
                                        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                                            {contact.email_support && <><Link to={`mailto:${contact.email_support}`}>{contact.email_support}</Link><br /></>}
                                            {contact.email_general && <Link to={`mailto:${contact.email_general}`}>{contact.email_general}</Link>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="400ms" data-wow-duration="1500ms" style={{ height: '100%', marginTop: '30px' }}>
                                    <div className="inner-box" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '55px 15px 0px 15px' }}>
                                        <div className="icon-box"><Image src="/website/assets/images/icons/icon-25.svg" alt="Icon" width={50} height={50} priority /></div>
                                        <h3 style={{ marginBottom: '5px' }}>Contact Us</h3>
                                        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                                            {contact.phone_primary && <><Link to={`tel:${contact.phone_primary.replace(/\s+/g, '')}`}>{contact.phone_primary}</Link><br /></>}
                                            {contact.phone_secondary && <Link to={`tel:${contact.phone_secondary.replace(/\s+/g, '')}`}>{contact.phone_secondary}</Link>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 info-block">
                                <div className="info-block-two wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms" style={{ height: '100%', marginTop: '30px' }}>
                                    <div className="inner-box" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '55px 15px 0px 15px' }}>
                                        <div className="icon-box" style={{ backgroundColor: '#0646ac', borderRadius: '18px', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '-50px' }}>
                                            <Clock size={40} color="#fff" />
                                        </div>
                                        <h3 style={{ marginBottom: '5px' }}>Working Hours</h3>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#666', fontWeight: 'bold' }}>
                                            <li style={{ marginBottom: '2px' }}>Mon - Fri: 9:30AM - 6:00PM</li>
                                            <li style={{ marginBottom: '2px' }}>Sat: 9:30AM - 2:30PM</li>
                                            <li style={{ marginBottom: '0' }}>Sun: Closed</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="google-map-section" style={{ padding: 0, marginBottom: '40px' }}>
                    <GoogleMapSection src={contact.google_maps_embed_url || undefined} />
                </section>
            </div>

            <section className="contact-section sec-pad">
                <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-42.png)" }}></div>
                <div className="auto-container">
                    <div className="inner-box">
                        <h2>Leave a Comment</h2>
                        <ContactForm />
                    </div>
                </div>
            </section>
        </div>
    );
}
