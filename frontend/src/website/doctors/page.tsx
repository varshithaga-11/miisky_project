import { useEffect, useState } from "react";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getTeamMembers } from "../../utils/api";
import { MOCK_DOCTORS } from "../utils/mockData";
import Cta from "../components/sections/home2/Cta";

export default function DoctorsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [doctors, setDoctors] = useState(MOCK_DOCTORS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
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
                <section className="team-page-section pt_120 pb_90 centred">
                    <div className="auto-container">
                        <div className="row clearfix">
                            {doctors.map((doctor: any, idx: number) => (
                                <div key={doctor.id} className="col-lg-4 col-md-6 col-sm-12 team-block">
                                    <div className="team-block-one wow fadeInUp animated" data-wow-delay={`${idx * 100}ms`} data-wow-duration="1500ms">
                                        <div className="inner-box">
                                            <figure className="image-box">
                                                <Link to={`/website/doctor-details?id=${doctor.id}`}>
                                                    <Image src={doctor.photo_url || "/website/assets/images/team/team-1.jpg"} alt={doctor.name} width={416} height={430} priority />
                                                </Link>
                                            </figure>
                                            <div className="content-box">
                                                <h3><Link to={`/website/doctor-details?id=${doctor.id}`}>{doctor.name}</Link></h3>
                                                <span className="designation">{doctor.designation}</span>
                                                <ul className="social-links clearfix">
                                                    <li><Link to="/website"><i className="fab fa-facebook-f"></i></Link></li>
                                                    <li><Link to="/website"><i className="fab fa-twitter"></i></Link></li>
                                                    <li><Link to="/website"><i className="fab fa-dribbble"></i></Link></li>
                                                    <li><Link to="/website"><i className="fab fa-behance"></i></Link></li>
                                                </ul>
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
