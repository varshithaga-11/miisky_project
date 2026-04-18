import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import { getJobListings } from '@/utils/api';

export default function CareersPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 6;

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Join Our Team");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                // Passing limit and page to API (if backend supports)
                const response = await getJobListings({ page: currentPage, limit: PAGE_SIZE });
                
                const isPaginated = !!response.data.results;
                const rawData = response.data.results || response.data;
                const total = response.data.count || (Array.isArray(rawData) ? rawData.length : 0);
                
                let displayJobs = Array.isArray(rawData) ? rawData : [];
                
                // Client-side fallback if backend returns unpaginated data or more than PAGE_SIZE
                if (!isPaginated || displayJobs.length > PAGE_SIZE) {
                    const start = isPaginated ? 0 : (currentPage - 1) * PAGE_SIZE;
                    displayJobs = displayJobs.slice(start, start + PAGE_SIZE);
                }

                setJobs(displayJobs);
                setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
            } catch (err) {
                console.error("Failed to fetch jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [currentPage]);

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
                    <>
                        <div className="row clearfix">
                            {jobs.map((job) => (
                                <div key={job.id} className="col-lg-6 col-md-12 col-sm-12 career-block">
                                    <div className="career-block-one">
                                        <div className="inner-box">
                                            <div className="job-meta mb_10">
                                                <span style={{ backgroundColor: '#0646ac', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                                                    {(job.job_type || "full_time").split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                                <span style={{ marginLeft: '10px', color: '#777', fontSize: '14px' }}><i className="fas fa-map-marker-alt"></i> {job.location || "Remote/Office"}</span>
                                                <span style={{ marginLeft: '10px', color: '#777', fontSize: '14px' }}>
                                                    <i className="far fa-calendar-alt"></i> Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recent"}
                                                </span>
                                                {job.application_deadline && (
                                                    <span style={{ marginLeft: '10px', color: '#e74c3c', fontSize: '14px', fontWeight: 600 }}>
                                                        <i className="far fa-clock"></i> Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="mb_15"><Link to={`/careers/${job.uid || job.id}`} style={{ color: '#111' }}>{job.title}</Link></h3>
                                            <div className="location mb_15" style={{ display: 'flex', alignItems: 'center', color: '#666', fontSize: '14px' }}>
                                                <i className="fas fa-map-marker-alt mr_10" style={{ color: '#0646ac' }}></i> {job.location || "Puducherry, India"}
                                                <i className="far fa-clock ml_15 mr_10" style={{ color: '#0646ac' }}></i> {(job.job_type || "Full Time").replace(/_/g, ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                                            </div>
                                            <div className="btn-box mt_20">
                                                <Link to={`/careers/${job.uid || job.id}`} className="theme-btn btn-one" style={{ padding: '8px 25px' }}>
                                                    <span>View Details</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="pagination-wrapper centred mt_40">
                                <ul className="pagination clearfix">
                                    <li>
                                        <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
                                            <i className="icon-21"></i>
                                        </Link>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i+1}>
                                            <Link to="#" className={currentPage === i + 1 ? "current" : ""} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                                                {(i + 1).toString().padStart(2, '0')}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
                                            <i className="icon-22"></i>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
