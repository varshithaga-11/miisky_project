import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { careersApi } from "../utils/api";
import { FileText, User, Briefcase, Upload, CheckCircle } from "lucide-react";

export default function CareerApplyPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    
    const [formData, setFormData] = useState({
        applicant_name: "",
        email: "",
        phone: "",
        portfolio_url: "",
        linkedin_url: "",
        current_ctc: "",
        expected_ctc: "",
        notice_period: "",
        years_of_experience: "",
        cover_letter: ""
    });
    
    const [resume, setResume] = useState<File | null>(null);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Job Application");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;
            try {
                const response = await careersApi.detail(id);
                setJob(response.data || response); 
            } catch (err) {
                console.error("Failed to fetch job listing:", err);
                setErrorMessage("Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf") {
                setErrorMessage("Please upload a PDF file for your resume.");
                return;
            }
            setResume(file);
            setErrorMessage("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resume) {
            setErrorMessage("Please upload your resume.");
            return;
        }

        setStatus("loading");
        setErrorMessage("");
        try {
            const data = new FormData();
            data.append("job", id || "");
            data.append("applicant_name", formData.applicant_name);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("resume", resume);
            data.append("cover_letter", formData.cover_letter);
            data.append("portfolio_url", formData.portfolio_url);
            data.append("linkedin_url", formData.linkedin_url);
            data.append("current_ctc", formData.current_ctc);
            data.append("expected_ctc", formData.expected_ctc);
            data.append("notice_period", formData.notice_period);
            data.append("years_of_experience", formData.years_of_experience);

            await careersApi.apply(data);
            setStatus("success");
            setTimeout(() => navigate("/careers"), 5000);
        } catch (err) {
            console.error("Application error:", err);
            setStatus("error");
            setErrorMessage("Failed to submit application. Please try again.");
        }
    };

    if (loading) return <div className="text-center p-5 mt_100">Loading application form...</div>;
    if (!job) return <div className="text-center p-5 mt_100">Job not found. <Link to="/careers">Go back</Link></div>;

    if (status === "success") {
        return (
            <section className="apply-success-section sec-pad centred">
                <div className="auto-container">
                    <div className="inner-box" style={{ maxWidth: '600px', margin: '0 auto', padding: '60px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                        <div className="icon-box mb_30" style={{ color: '#0646ac' }}>
                            <CheckCircle size={80} />
                        </div>
                        <h2 className="mb_20" style={{ fontWeight: 800 }}>Application Received!</h2>
                        <p className="mb_30" style={{ color: '#666', fontSize: '16px' }}>
                            Thank you, <strong>{formData.applicant_name}</strong>. Your application for <strong>{job.title}</strong> has been successfully submitted. Our HR team will review your profile and contact you if it matches our requirements.
                        </p>
                        <Link to="/careers" className="theme-btn btn-one">
                            <span>Back to Careers</span>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="job-apply-section p_relative sec-pad-2">
            <div className="auto-container">
                <div className="row clearfix">
                    <div className="col-lg-10 offset-lg-1 col-md-12 col-sm-12 content-column">
                        <div className="apply-form-box" style={{ backgroundColor: '#fff', padding: '60px', borderRadius: '30px', border: '1px solid #f0f0f0', boxShadow: '0 15px 50px rgba(0,0,0,0.03)' }}>
                            <div className="form-header mb_40 pb_30" style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <div className="row align-items-end">
                                    <div className="col-md-8">
                                        <span style={{ color: '#0646ac', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>Apply For Position</span>
                                        <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '5px' }}>{job.title}</h2>
                                    </div>
                                    <div className="col-md-4 text-md-right">
                                        <span style={{ backgroundColor: '#f0f4ff', color: '#0646ac', padding: '6px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                                            {job.location || "Remote/Office"} • {job.type || "Full Time"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="default-form">
                                <div className="row clearfix">
                                    <div className="col-lg-12 mb_30">
                                        <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <User size={20} color="#0646ac" /> Personal Information
                                        </h4>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Full Name *</label>
                                        <input type="text" name="applicant_name" value={formData.applicant_name} onChange={handleInputChange} placeholder="Your legal name" required 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Email Address *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" required 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Phone Number *</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXX XXX XXX" required 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Years of Experience</label>
                                        <input type="number" step="0.5" name="years_of_experience" value={formData.years_of_experience} onChange={handleInputChange} placeholder="e.g. 3" 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>

                                    <div className="col-lg-12 mb_30 mt_20">
                                        <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Briefcase size={20} color="#0646ac" /> Professional Details
                                        </h4>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>LinkedIn Profile</label>
                                        <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Portfolio/Website URL</label>
                                        <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleInputChange} placeholder="https://yourportfolio.com" 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>
                                    <div className="col-lg-4 col-md-4 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Current CTC</label>
                                        <input type="text" name="current_ctc" value={formData.current_ctc} onChange={handleInputChange} placeholder="e.g. 10 LPA" 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>
                                    <div className="col-lg-4 col-md-4 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Expected CTC</label>
                                        <input type="text" name="expected_ctc" value={formData.expected_ctc} onChange={handleInputChange} placeholder="e.g. 15 LPA" 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>
                                    <div className="col-lg-4 col-md-4 col-sm-12 form-group mb_25">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Notice Period</label>
                                        <input type="text" name="notice_period" value={formData.notice_period} onChange={handleInputChange} placeholder="e.g. 30 Days" 
                                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none' }} />
                                    </div>

                                    <div className="col-lg-12 mb_30 mt_20">
                                        <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Upload size={20} color="#0646ac" /> Documents
                                        </h4>
                                    </div>
                                    <div className="col-lg-12 form-group mb_30">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', display: 'block' }}>Upload Resume (PDF only) *</label>
                                        <div 
                                            style={{ 
                                                border: '2px dashed #ddd', padding: '30px', borderRadius: '15px', textAlign: 'center',
                                                backgroundColor: resume ? '#f0faff' : '#fcfcfc', transition: 'all 0.3s ease',
                                                cursor: 'pointer', position: 'relative'
                                            }}
                                            onClick={() => document.getElementById('resume-upload')?.click()}
                                        >
                                            <input type="file" id="resume-upload" onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
                                            {resume ? (
                                                <div>
                                                    <FileText size={40} color="#0646ac" style={{ marginBottom: '10px' }} />
                                                    <p style={{ fontWeight: 700, color: '#111' }}>{resume.name}</p>
                                                    <p style={{ fontSize: '12px', color: '#666' }}>Click to change file</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload size={40} color="#ccc" style={{ marginBottom: '10px' }} />
                                                    <p style={{ fontWeight: 600, color: '#777' }}>Drag & drop or <span style={{ color: '#0646ac' }}>browse</span></p>
                                                    <p style={{ fontSize: '12px', color: '#999' }}>Adobe PDF Format only (Max 5MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-lg-12 form-group mb_30">
                                        <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Cover Letter (Optional)</label>
                                        <textarea name="cover_letter" value={formData.cover_letter} onChange={handleInputChange} placeholder="Tell us why you are a great fit for this role..." 
                                            style={{ width: '100%', padding: '15px 20px', borderRadius: '10px', border: '1.5px solid #eee', outline: 'none', minHeight: '150px' }}></textarea>
                                    </div>

                                    <div className="col-lg-12 form-group message-btn mt_20">
                                        <button type="submit" className="theme-btn btn-one" disabled={status === "loading"} 
                                            style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: 700, borderRadius: '40px', opacity: status === "loading" ? 0.7 : 1 }}>
                                            <span>{status === "loading" ? "Submitting Application..." : "Submit Application"}</span>
                                        </button>
                                        {status === "error" && (
                                            <p style={{ color: 'red', marginTop: '15px', textAlign: 'center', fontWeight: 600 }}>{errorMessage}</p>
                                        )}
                                        {status === "idle" && errorMessage && (
                                            <p style={{ color: '#0646ac', marginTop: '15px', textAlign: 'center', fontWeight: 600 }}>{errorMessage}</p>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
