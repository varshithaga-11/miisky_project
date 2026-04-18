import { useEffect, useState } from "react";
import Image from '@website/components/Image';
import { Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import { getTeamMembers } from '@/utils/api';
import { MOCK_DOCTORS } from "../utils/mockData";
import Cta from '@website/components/sections/home2/Cta';

export default function DoctorsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [doctors, setDoctors] = useState(MOCK_DOCTORS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Our Doctors");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const response = await getTeamMembers();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setDoctors(data.length > 0 ? data : MOCK_DOCTORS);
            } catch (err) {
                console.warn('Failed to fetch doctors:', err);
                setDoctors(MOCK_DOCTORS);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

    return (
        <div className="boxed_wrapper">
                <section className="team-page-section pt_120 pb_150 centred overflow-hidden">
                    <div className="auto-container mb_50">
                        <div className="sec-title mb_50">
                            <span className="sub-title mb_5">Expert Medical Team</span>
                            <h2>Meet Our Dedicated Doctors</h2>
                        </div>
                    </div>
                    
                    <div className="marquee-container p_relative d_block overflow-hidden" 
                         style={{ 
                             maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                             WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
                         }}>
                        <div className="marquee-content d-flex align-items-center">
                            {/* Duplicate the array to create a seamless loop */}
                            {[...doctors, ...doctors].map((doctor: any, idx: number) => (
                                <div key={`${doctor.id}-${idx}`} className="team-block mx_20 flex-shrink-0" style={{ width: '350px' }}>
                                    <div className="team-block-one">
                                        <div className="inner-box" style={{ borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                                            <figure className="image-box" style={{ margin: 0, height: '400px', overflow: 'hidden' }}>
                                                <Link to={`/doctor-details/${doctor.uid || doctor.id}`}>
                                                    <Image 
                                                        src={doctor.photo_url || "/website/assets/images/team/team-1.jpg"} 
                                                        alt={doctor.name} 
                                                        width={350} 
                                                        height={400} 
                                                        style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.5s ease' }}
                                                    />
                                                </Link>
                                            </figure>
                                            <div className="content-box p_20" style={{ borderTop: '1px solid #eee' }}>
                                                <h3 style={{ fontSize: '20px', fontWeight: 800 }}><Link to={`/doctor-details/${doctor.uid || doctor.id}`} style={{ color: '#111' }}>{doctor.name}</Link></h3>
                                                <span className="designation" style={{ color: '#0646ac', fontWeight: 600 }}>{doctor.designation}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <Cta/>
        </div>
    );
}
