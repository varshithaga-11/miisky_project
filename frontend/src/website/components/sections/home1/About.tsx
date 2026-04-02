import { useState, useEffect } from "react";
import Image from "../../Image";
import { getAboutSections } from "@/utils/api";

export default function About() {
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAboutSections() as any;
                // Pick the first active config from results
                const sections = res.data?.results || [];
                if (sections.length > 0) {
                    setConfig(sections[0]);
                }
            } catch (err) {
                console.error("Failed to fetch about config:", err);
            }
        };
        fetchData();
    }, []);

    if (!config) return null;

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
                                        <span className="sub-title mb_5">{config.about_tagline}</span>
                                        <h2>{config.about_title}</h2>
                                    </div>
                                    <div className="text-box mb_30 pb_30">
                                        <p>{config.about_description}</p>
                                    </div>
                                    <div className="inner-box">
                                        <div className="row clearfix">
                                            <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                <div className="specialities-box">
                                                    <h4>Our Specialities</h4>
                                                    <ul className="list-style-one clearfix">
                                                        {config.about_specialties?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                <div className="specialities-box">
                                                    <h4>Our Vision</h4>
                                                    <ul className="list-style-one clearfix">
                                                        {config.about_vision?.map((item: string, i: number) => <li key={i}>{item}</li>)}
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
                                    <figure className="image">
                                        <Image src={config.about_image_1_url || "/website/assets/images/background/company.jpg"} alt="Company Overview" width={523} height={399} priority />
                                    </figure>
                                    <div className="text-box">
                                        <div className="image-shape" style={{ backgroundImage: "url(/website/assets/images/shape/shape-7.png)" }}></div>
                                        <h2>{config.about_experience_years}</h2>
                                        <span>{config.about_experience_text}</span>
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
