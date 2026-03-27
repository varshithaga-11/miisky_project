import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getJobListings } from "../../utils/api";

export default function CareersPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Join Our Team");
        const fetchJobs = async () => {
            try {
                const response = await getJobListings();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setJobs(data);
            } catch (err) {
                console.error("Failed to fetch jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <section className="careers-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="sec-title mb_50 centred">
                    <span className="sub-title mb_5">Careers</span>
                    <h2>Current Opportunities</h2>
                    <p>We are always looking for passionate professionals to join our mission of simplifying health.</p>
                </div>
                {loading ? (
                    <div className="text-center p-5">Loading job listings...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center p-5">No open positions at the moment. Please check back later.</div>
                ) : (
                    <div className="row clearfix">
                        {jobs.map((job) => (
                            <div key={job.id} className="col-lg-6 col-md-12 col-sm-12 career-block">
                                <div className="career-block-one" style={{ padding: '30px', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fff', marginBottom: '30px', transition: 'all 0.3s ease', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                                    <div className="inner-box">
                                        <div className="job-meta mb_10">
                                            <span style={{ backgroundColor: '#0646ac', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{job.type || "Full Time"}</span>
                                            <span style={{ marginLeft: '10px', color: '#777', fontSize: '14px' }}><i className="fas fa-map-marker-alt"></i> {job.location || "Remote/Office"}</span>
                                        </div>
                                        <h3 className="mb_15"><Link to={`/website/careers/${job.id}`} style={{ color: '#111' }}>{job.title}</Link></h3>
                                        <p className="mb_20" style={{ color: '#555' }}>{job.description ? job.description.substring(0, 150) + "..." : "Excellent opportunity to grow your career in a dynamic environment."}</p>
                                        <div className="btn-box">
                                            <Link to={`/website/careers/${job.id}`} className="theme-btn btn-one" style={{ padding: '8px 25px' }}>
                                                <span>Apply Now</span>
                                            </Link>
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
