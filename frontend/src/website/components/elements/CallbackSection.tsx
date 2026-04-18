
import { useState } from "react";
import { toast } from "react-toastify";
import { contactApi } from '@website/utils/api';

export default function CallbackSection() {
    const [formData, setFormData] = useState({
        email: "",
        phone: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email && !formData.phone) {
            toast.error("Please provide at least an email or phone number.");
            return;
        }

        setLoading(true);
        try {
            await contactApi.send({
                ...formData,
                inquiry_type: "callback",
                name: "Callback Request",
                message: "urgent callback request"
            });
            toast.success("Callback request sent successfully! ✅");
            setFormData({ email: "", phone: "" });
        } catch (err: any) {
            toast.error(err.message || "Failed to send callback request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="callback-section p_relative" style={{ backgroundColor: '#1cb29b', padding: '25px 0' }}>
            <div className="container-fluid res-container-px">
                <div className="row align-items-center">
                    <div className="col-lg-4 col-md-12 col-sm-12">
                        <div className="text mb-md-3 mb-sm-3">
                            <h2 className="color_white fs_30 fw_bold mb-0 text-uppercase tracking_1">Request for Callback</h2>
                        </div>
                    </div>
                    <div className="col-lg-8 col-md-12 col-sm-12">
                        <form onSubmit={handleSubmit} className="callback-form d-flex align-items-center flex-wrap gap-3 justify-content-lg-end">
                            <div className="form-group mb-0 p_relative" style={{ flex: '1 1 250px', maxWidth: '350px' }}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email..."
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="fs_15"
                                    style={{
                                        background: 'rgba(255,255,255,1)',
                                        border: 'none',
                                        color: '#333',
                                        borderRadius: '5px',
                                        width: '100%',
                                        padding: '15px 45px 15px 20px',
                                        outline: 'none'
                                    }}
                                />
                                <i className="far fa-envelope p_absolute" style={{ right: '15px', color: '#1cb29b', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}></i>
                            </div>
                            <div className="form-group mb-0 p_relative" style={{ flex: '1 1 250px', maxWidth: '350px' }}>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="fs_15"
                                    style={{
                                        background: 'rgba(255,255,255,1)',
                                        border: 'none',
                                        color: '#333',
                                        borderRadius: '5px',
                                        width: '100%',
                                        padding: '15px 45px 15px 20px',
                                        outline: 'none'
                                    }}
                                />
                                <i className="fas fa-phone p_absolute" style={{ right: '15px', color: '#1cb29b', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}></i>
                            </div>
                            <div className="form-group mb-0">
                                <button
                                    type="submit"
                                    className="callback-submit-btn"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#fff',
                                        color: '#1cb29b',
                                        padding: '12px 35px',
                                        borderRadius: '5px',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        height: '56px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`
                .callback-form input::placeholder {
                    color: #999;
                    opacity: 1;
                }
                .callback-submit-btn:hover {
                    background-color: #f0f0f0 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                @media (max-width: 991px) {
                    .callback-section {
                        text-align: center;
                    }
                    .callback-form {
                        justify-content: center !important;
                    }
                    .callback-form .form-group {
                        max-width: 100% !important;
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
}
