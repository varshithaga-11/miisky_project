import { useState, useEffect } from "react";
import Image from "../../Image";
import { getCompanyInfo } from "@/utils/api";

export default function About() {
    const [stats, setStats] = useState({
        years_experience: 30,
        doctors_count: "180+",
        services_count: "200+",
        satisfied_patients: "10k+",
        specialities: ["Preventive care", "Diagnostic testing", "Mental health services"],
        vision: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
    });

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
            } catch (err) {
                console.error("Failed to fetch info:", err);
            }
        };
        fetchData();
    }, []);

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
                <div className="upper-content">
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
                                    <figure className="image"><Image src="/website/assets/images/background/company.jpg" alt="Company Overview" width={523} height={399} priority /></figure>
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
            </div>
        </section>
  );
}
