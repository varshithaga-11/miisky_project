import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import { getJobListingById } from '@/utils/api';
import Cta from '@website/components/sections/home2/Cta';

export default function CareerDetailsPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { uid } = useParams<{ uid: string }>();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Job Opportunity");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchJobData = async () => {
            if (!uid) return;
            try {
                setLoading(true);
                const response = await getJobListingById(uid);
                setJob(response.data);
            } catch (err) {
                console.error("Failed to fetch job listing details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobData();
    }, [uid]);

    if (loading) return <div className="text-center p-5 mt_100">Loading job details...</div>;
    if (!job) return <div className="text-center p-5 mt_100">Job not found. <Link to="/careers">Go back</Link></div>;

    return (
        <div className="career-details-page">
            <section className="career-details-section p_relative">
                <div className="auto-container">
                    <div className="row clearfix">
                        <div className="col-lg-8 col-md-12 col-sm-12 career-details-content">
                            <div className="content-box">
                                <div className="job-header">
                                    <h1 className="job-title">{job.title}</h1>
                                    <div className="job-meta-list">
                                        <span className="job-type-badge">
                                            {(job.job_type || "full_time").split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </span>
                                        <span className="job-meta-item"><i className="fas fa-map-marker-alt"></i> {job.location || "Remote/Office"}</span>
                                        <span className="job-meta-item"><i className="far fa-calendar-alt"></i> Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recent"}</span>
                                        {job.application_deadline && (
                                            <span className="job-meta-item" style={{ color: '#e74c3c', fontWeight: 700 }}><i className="far fa-clock"></i> Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="job-description mb_50">
                                    <h3>Job Overview</h3>
                                    <p>{job.job_description || "Detailed overview of the role and its impact within the organization."}</p>

                                    <h3>{job.tagline || "Role Overview"}</h3>
                                    <p>{job.expertise_text || job.short_description || "Professional medical expertise and dedication to patient care."}</p>
                                    
                                    <h3>Detailed Scope & Research</h3>
                                    <p>{job.detailed_description || "Their practitioners use a range of techniques and technologies to diagnose and treat illnesses and injuries."}</p>
                                    
                                    <h3>Core Responsibilities</h3>
                                    <p>{job.responsibilities || job.job_description || "As a key member of our team, you will be responsible for leading several important clinical and technical projects."}</p>
                                    
                                    <h3>Requirements & Skills</h3>
                                    <p>{job.requirements || "We require strong communication skills and experience in healthcare technology."}</p>
                                    
                                    <h3>What We Offer</h3>
                                    <p>{job.benefits || "Competitive salary and benefits package that includes healthcare, retirement plans, and flexible working arrangements."}</p>
                                </div>

                                <div className="apply-card">
                                    <h3>Ready to join us?</h3>
                                    <p>Interested candidates are requested to send their resumes and portfolios for consideration. We're looking forward to meeting you!</p>
                                    <div className="btn-box text-center">
                                        <Link to={`/careers/apply/${uid}`} className="theme-btn btn-one" style={{ padding: '12px 30px', borderRadius: '40px', fontSize: '18px', whiteSpace:'nowrap' }}>
                                            <span>Apply Now</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-4 col-md-12 col-sm-12 career-details-sidebar">
                            <div className="sidebar p_relative ml_20 d_block">
                                <div className="sidebar-widget-main">
                                    <h3>Job Details</h3>
                                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', marginBottom: '20px' }} />
                                    <ul style={{ listStyle: 'none', padding: '0' }}>
                                        <li className="mb_15 pb_10" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '13px' }}>Salary Range</span>
                                            <span style={{ fontWeight: 600 }}>{job.salary_range || "Competitive"}</span>
                                        </li>
                                        <li className="mb_15 pb_10" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '13px' }}>Education Required</span>
                                            <span style={{ fontWeight: 600 }}>{job.qualification_required || "Bachelor's or Higher"}</span>
                                        </li>
                                        <li className="mb_15 pb_10" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '13px' }}>Experience Range</span>
                                            <span style={{ fontWeight: 600 }}>{job.experience_required || "Not specified"}</span>
                                        </li>
                                        {job.application_deadline && (
                                            <li className="mb_15 pb_10">
                                                <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '13px' }}>Application Deadline</span>
                                                <span style={{ fontWeight: 700, color: '#f8d2d2' }}>{new Date(job.application_deadline).toLocaleDateString()}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div className="sidebar-widget-about">
                                    <h3>About Miisky</h3>
                                    <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.7' }}>
                                        At Miisky, we are dedicated to simplifying health using cutting-edge technology and research. Join our team to make a real impact on patient outcomes globally.
                                    </p>
                                    <Link to="/about" style={{ fontSize: '14px', color: '#0646ac', fontWeight: 700, marginTop: '10px', display: 'inline-block' }}>Learn more about us <i className="fas fa-arrow-right ml_5"></i></Link>
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
