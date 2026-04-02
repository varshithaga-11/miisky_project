import { useState, useEffect } from "react";
import ModalVideo from "../../elements/VideoPopup";
import { Link } from "react-router-dom";
import { getAboutSections } from "@/utils/api";

export default function Chooseus() {
  const [activeTab, setActiveTab] = useState(1);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await getAboutSections() as any;
            const sections = res.data?.results || [];
            if (sections.length > 0) {
                setConfig(sections[0]);
            }
        } catch (err) {
            console.error("Failed to fetch choose highlights:", err);
        }
    };
    fetchData();
  }, []);

  if (!config) return null;

  const tabs = [
    { id: 1, title: config.speciality_label || "Modern Technology" },
  ];

  const tabContent = [
    {
      id: 1,
      videoImg: config.video_image_url || "/website/assets/images/background/company.jpg",
      heading: config.speciality_title || "Modern Technology",
      text: config.speciality_description || "The phrase emphasizes the importance of healthcare providers...",
      list: config.speciality_points || [],
      video_url: config.video_url
    },
  ];

  return (
    <section className="chooseus-section sec-pad p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-15.png)" }}
      ></div>

      <div className="auto-container">
        <div className="sec-title centred mb_55">
          <span className="sub-title mb_5">{config.choose_tagline}</span>
          <h2>{config.choose_title}</h2>
          <p>
            {config.choose_description}
          </p>
        </div>

        {/* Tabs Buttons */}
        <div className="tabs-box">
          <div className="tab-btns tab-buttons clearfix centred mb_40">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active-btn" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <h3>{tab.title}</h3>
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="tabs-content">
            {tabContent.map((content) => (
              <div
                key={content.id}
                className={`tab ${activeTab === content.id ? "active-tab" : ""}`}
              >
                <div className="inner-box">
                  <div
                    className="shape"
                    style={{ backgroundImage: "url(/website/assets/images/shape/shape-14.png)" }}
                  ></div>
                  <div className="row clearfix">
                    <div className="col-lg-6 col-md-12 col-sm-12 video-column">
                      <div
                        className="video-inner"
                        style={{ backgroundImage: `url(${content.videoImg})` }}
                      >
                        <div className="video-btn">
                          {content.video_url ? (
                              <ModalVideo videoId={content.video_url} />
                          ) : (
                              <ModalVideo />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                      <div className="content-block-two">
                        <div className="content-box ml_40">
                          <div className="text-box">
                            <h3>{content.heading}</h3>
                            <p>{content.text}</p>
                          </div>
                          <ul className="list-style-one clearfix">
                            {content.list.map((item: string, index: number) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                          <div className="btn-box">
                            <Link to="/departments" className="theme-btn btn-two">
                              <span>See All Services</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
