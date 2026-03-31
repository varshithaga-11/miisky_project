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
            "pricing": "Pricing.jpg",
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
        <section className="page-title p_relative centred" style={{ position: 'relative', overflow: 'hidden' }}>
            <div 
                className="bg-layer" 
                style={{ 
                    backgroundImage: `url("/website/assets/images/background/${bgImage}")`,
                    zIndex: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            ></div>
            
            <div className="auto-container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="content-box">
                    <h1>{breadcrumbTitle}</h1>
                    <ul className="bread-crumb clearfix">
                        <li><Link to="/website">Home</Link></li>
                        <li>{breadcrumbTitle}</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Breadcrumb;
