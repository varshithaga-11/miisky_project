import { useState, FormEvent, useEffect } from "react";
import Image from "../../Image";
import { appointmentApi, getCompanyInfo, getDepartments } from "@/utils/api";
import { MOCK_DEPARTMENTS } from "@/Website/utils/mockData";

export default function About() {
    const [date, setDate] = useState("");
    const [phone, setPhone] = useState("");
    const [service, setService] = useState("");
    const [bookStatus, setBookStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [stats, setStats] = useState({
        years_experience: 30,
        doctors_count: "180+",
        services_count: "200+",
        satisfied_patients: "10k+",
        specialities: ["Preventive care", "Diagnostic testing", "Mental health services"],
        vision: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
    });
    const [departments, setDepartments] = useState<any[]>(MOCK_DEPARTMENTS);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const infoRes = await getCompanyInfo();
                const info = Array.isArray(infoRes.data) ? infoRes.data[0] : infoRes.data;
                if (info) {
                    setStats({
                        years_experience: info.years_experience || 30,
                        doctors_count: info.doctors_count || "180+",
                        services_count: info.services_count || "200+",
                        satisfied_patients: info.satisfied_patients || "10k+",
                        specialities: info.our_specialities || ["Preventive care", "Diagnostic testing", "Mental health services"],
                        vision: info.our_vision || ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
                    });
                }

                const deptRes = await getDepartments();
                const depts = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data.results || [];
                if (depts.length > 0) setDepartments(depts);
            } catch (err) {
                console.error("Failed to fetch info:", err);
            }
        };
        fetchData();
    }, []);

    const handleBook = async (e: FormEvent) => {
        e.preventDefault();
        setBookStatus("loading");
        try {
            await appointmentApi.create({ name: "", email: "", phone, date, department: service });
            setBookStatus("success");
            setDate(""); setPhone(""); setService("");
        } catch {
            setBookStatus("error");
        }
    };
  return (
        <section className="about-section p_relative">
            <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-8.png)" }}></div>
            <div className="wave-layer">
                <div className="wave-1">
                    <svg width="318" height="131" viewBox="0 0 318 131" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 69.0468L74.0685 69.0468L98.2276 40.7213L125.459 121L164.762 10L191.919 105.268L208.417 57.4162L233.167 87.0291L249.076 69.0468L308 69.0468" stroke="#BDBDBD"/>
                    </svg>
                </div>
                <div className="wave-2">
                    <svg width="318" height="131" viewBox="0 0 318 131" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 69.0468L74.0685 69.0468L98.2276 40.7213L125.459 121L164.762 10L191.919 105.268L208.417 57.4162L233.167 87.0291L249.076 69.0468L308 69.0468" stroke="#BDBDBD"/>
                    </svg>
                </div>
            </div>
            <div className="auto-container">
                <div className="upper-content mb_80">
                    <div className="row clearfix">
                        <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                            <div className="content-block-one">
                                <div className="content-box">
                                    <div className="sec-title mb_15">
                                        <span className="sub-title mb_5">About the company</span>
                                        <h2>Expertise and compassion saved my life</h2>
                                    </div>
                                    <div className="text-box mb_30 pb_30">
                                        <p>The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me</p>
                                    </div>
                                    <div className="inner-box">
                                        <div className="row clearfix">
                                            <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                <div className="specialities-box">
                                                    <h4>Our Specialities</h4>
                                                    <ul className="list-style-one clearfix">
                                                        {stats.specialities.map((item: any, i: number) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                <div className="specialities-box">
                                                    <h4>Our Vision</h4>
                                                    <ul className="list-style-one clearfix">
                                                        {stats.vision.map((item: any, i: number) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                            <div className="image-block-one">
                                <div className="image-box">
                                    <div className="shape">
                                        <div className="shape-1" style={{ backgroundImage: "url(/website/assets/images/shape/shape-9.png)" }}></div>
                                        <div className="shape-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-10.png)" }}></div>
                                    </div>
                                    <figure className="image"><Image src="/website/assets/images/resource/about-1.jpg" alt="About Image" width={523} height={399} priority /></figure>
                                    <div className="text-box">
                                        <div className="image-shape"style={{ backgroundImage: "url(/website/assets/images/shape/shape-7.png)" }}></div>
                                        <h2>{stats.years_experience}</h2>
                                        <span>Years of Experience in This Field</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="appointment-box">
                    <h4>Book an Appointment</h4>
                    <div className="form-inner">
                        {bookStatus === "success" ? (
                            <p style={{ color: "green", padding: "12px 0" }}>✅ Appointment requested! We will call you soon.</p>
                        ) : (
                        <form onSubmit={handleBook} className="clearfix">
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-15"></i></div>
                                <span>Choose service</span>
                                <div className="select-box">
                                    <select
                                        className="selectmenu"
                                        value={service}
                                        onChange={(e) => setService(e.target.value)}
                                    >
                                        <option value="">Select a service</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-16"></i></div>
                                <span>Date</span>
                                <input
                                    type="date"
                                    id="date"
                                    placeholder="MM / DD / YYYY"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-17"></i></div>
                                <span>Phone</span>
                                <input
                                    type="text"
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+ 1 (XXX) XXX XXX"
                                    required
                                />
                            </div>
                            {bookStatus === "error" && (
                                <p style={{ color: "red", marginBottom: "8px" }}>Something went wrong. Please try again.</p>
                            )}
                            <div className="message-btn">
                                <button type="submit" className="theme-btn btn-one" disabled={bookStatus === "loading"}>
                                    <span>{bookStatus === "loading" ? "Booking..." : "Book Now"}</span>
                                </button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
  );
}
