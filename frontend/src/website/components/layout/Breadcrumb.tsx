import React from "react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbProps {
  breadcrumbTitle: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbTitle }) => {
    const location = useLocation();
    const pathname = location.pathname.toLowerCase();

    // Dynamic mapping of page titles to uploaded background images
    const getBackgroundImage = (title: string) => {
        const normalizedTitle = title.toLowerCase().trim();
        const images: { [key: string]: string } = {
            "about us": "About us.jpg",
            "our blog": "Blog.jpg",
            "blog grid": "Blog.jpg",
            "blog details": "Blog.jpg",
            "blog standard": "Blog.jpg",
            "share your story": "Blog.jpg",
            "our departments": "Department.jpg",
            "department details": "Department.jpg", 
            "our doctors": "Doctors.jpg",
            "doctor details": "Doctor detail.jpg",
            "faq": "FAQ.jpg",
            "frequently asked questions": "FAQ.jpg",
            "innovation": "Innovation.jpg",
            "research papers": "Innovation.jpg",
            "patents": "Innovation.jpg",
            "innovation & research": "Innovation.jpg",
            "research details": "Innovation.jpg",
            "patent details": "Innovation.jpg",
            "pricing": "Plan.jpg",
            "plans": "Plan.jpg",
            "medical devices": "medical_devices.jpg",
            "products": "medical_devices.jpg",
            "innovative medical solutions": "medical_devices.jpg",
            "device details": "medical_devices.jpg",
            "device categories": "medical_devices.jpg",
            "our trusted partners": "our_partners.jpg",
            "our partners": "our_partners.jpg",
            "partner details": "our_partners.jpg",
            "contact us": "contact.jpg",
            "join our team": "Careers.jpg",
            "job opportunity": "Careers.jpg",
            "careers": "Careers.jpg",
            "our gallery": "Gallery.jpg",
            "gallery item": "Gallery.jpg",
            "portfolio one": "Gallery.jpg",
            "portfolio two": "Gallery.jpg",
            "page not found": "page-title.jpg",
        };
        
        // Check for exact match first
        if (images[normalizedTitle]) {
            return images[normalizedTitle];
        }
        
        // Priority check based on URL path
        if (pathname.includes("doctor-details") || pathname.includes("doctor_details")) {
            return "Doctor detail.jpg";
        }
        if (pathname.includes("department-details") || pathname.includes("department_details")) {
            return "Department detail.jpg";
        }
        if (pathname.includes("careers")) {
            return "Careers.jpg";
        }
        if (pathname.includes("gallery")) {
            return "Gallery.jpg";
        }

        // Fallback checks based on title content
        if (normalizedTitle.includes("doctor") || normalizedTitle.includes("dr.") || normalizedTitle.startsWith("ms.") || normalizedTitle.startsWith("mr.") || normalizedTitle.startsWith("prof.") || normalizedTitle.startsWith("miss.")) {
            return "Doctor detail.jpg";
        }
        if (normalizedTitle.includes("department")) {
            return "Department detail.jpg";
        }
        if (normalizedTitle.includes("patent")) {
            return "patent.jpg";
        }
        
        return "page-title.jpg";
    };

    const bgImage = getBackgroundImage(breadcrumbTitle);
    
    return (
        <section className="page-title p_relative" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            textAlign: 'left',
            paddingTop: '100px',
            paddingBottom: '100px',
            backgroundColor: '#000' 
        }}>
            {/* Background Image Layer with Blur and Opacity */}
            <div 
                className="bg-layer" 
                style={{ 
                    backgroundImage: `url("/website/assets/images/background/${bgImage}")`,
                    zIndex: 0,
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: 'calc(100% + 20px)',
                    height: 'calc(100% + 20px)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(5px)',
                    opacity: '0.5'
                }}
            ></div>

            {/* Dark Gradient Overlay for better text separation */}
            <div 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                    zIndex: 1
                }}
            ></div>
            
            <div className="auto-container" style={{ position: 'relative', zIndex: 2 }}>
                <div className="content-box" style={{ textAlign: 'left' }}>
                    <h1 style={{ 
                        marginBottom: '10px', 
                        fontSize: '56px', 
                        fontWeight: '900', 
                        color: '#ffffff !important',
                        letterSpacing: '-1px',
                        textTransform: 'uppercase'
                    }}>
                        {breadcrumbTitle}
                    </h1>
                    <ul className="bread-crumb clearfix" style={{ 
                        justifyContent: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0', /* No default gap */
                        listStyle: 'none',
                        margin: 0,
                        padding: 0
                    }}>
                        <li style={{ paddingRight: '0 !important' }}>
                            <Link to="/" style={{ color: '#ffffff !important', textDecoration: 'none' }}>Home</Link>
                        </li>
                        <li className="separator" style={{ color: '#ffffff', opacity: 0.5, margin: '0 4px', fontSize: '10px' }}>{'>'}</li>
                        <li style={{ paddingLeft: '0 !important', color: '#ffffff !important' }}>
                            {breadcrumbTitle}
                        </li>
                    </ul>
                </div>
            </div>
            
            <style>{`
                .page-title h1 { 
                    animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    color: #ffffff !important;
                }
                .bread-crumb li:after, .bread-crumb li:before {
                    display: none !important;
                }
                .bread-crumb li, .bread-crumb li a {
                    color: #ffffff !important;
                }
                @keyframes slideInLeft { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                
                @media (max-width: 767px) {
                    .page-title {
                        padding-top: 25px !important;
                        padding-bottom: 25px !important;
                        min-height: 140px !important; /* Slightly increased cutoff */
                        display: flex !important;
                        align-items: center !important;
                    }
                    .page-title .content-box {
                        display: flex !important;
                        flex-direction: column !important; /* Forces title then breadcrumb */
                    }
                    .page-title h1 {
                        font-size: 24px !important; /* Clearly the primary title */
                        margin-bottom: 0px !important; /* NO GAP */
                        order: 1 !important;
                        color: #ffffff !important;
                    }
                    .page-title .bread-crumb {
                        font-size: 9px !important; /* Tiny secondary info */
                        text-transform: uppercase;
                        letter-spacing: 0 !important;
                        opacity: 0.6; /* Higher contrast difference */
                        margin-top: -2px !important; /* Even pull it closer */
                        order: 2 !important;
                        display: flex !important;
                        flex-direction: row !important; /* Items side by side */
                        align-items: center !important;
                        gap: 0 !important; /* NO GAP */
                    }
                    .page-title .bread-crumb li, 
                    .page-title .bread-crumb li a {
                        font-size: 9px !important;
                        color: #ffffff !important; /* Forces it to white like the title */
                        line-height: 1 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .page-title .bread-crumb li {
                        display: flex !important;
                        align-items: center !important;
                    }
                    .page-title .bread-crumb li.separator {
                        margin: 0 3px !important; /* Minimum visibility gap */
                        font-size: 8px !important;
                        opacity: 0.4 !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default Breadcrumb;
