import { useState } from "react";
import ModalVideo from "../../../components/elements/VideoPopup";
import { Link } from "react-router-dom";

export default function Chooseus() {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, title: "Modern Technology" },
    { id: 2, title: "Success of Treatments" },
    { id: 3, title: "Certified Doctors" },
  ];

  const tabContent = [
    {
      id: 1,
      videoImg: "/assets/images/resource/video-1.jpg",
      heading: "Modern Technology",
      text: "The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.",
      list: [
        "Your Health is Our Top Priority",
        "Compassionate Care, Innovative Treatments",
        "We Treat You Like Family",
        "Leading the Way in Medical Excellence",
      ],
    },
    {
      id: 2,
      videoImg: "/assets/images/resource/video-1.jpg",
      heading: "Success of Treatments",
      text: "The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.",
      list: [
        "Your Health is Our Top Priority",
        "Compassionate Care, Innovative Treatments",
        "We Treat You Like Family",
        "Leading the Way in Medical Excellence",
      ],
    },
    {
      id: 3,
      videoImg: "/assets/images/resource/video-1.jpg",
      heading: "Certified Doctors",
      text: "The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.",
      list: [
        "Your Health is Our Top Priority",
        "Compassionate Care, Innovative Treatments",
        "We Treat You Like Family",
        "Leading the Way in Medical Excellence",
      ],
    },
  ];

  return (
    <section className="chooseus-section sec-pad p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/assets/images/shape/shape-15.png)" }}
      ></div>

      <div className="auto-container">
        <div className="sec-title centred mb_55">
          <span className="sub-title mb_5">Why Choose Us</span>
          <h2>What&apos;s Our Speciality</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and
            preventive care for various <br /> illnesses, injuries, and diseases. It
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
                    style={{ backgroundImage: "url(/assets/images/shape/shape-14.png)" }}
                  ></div>
                  <div className="row clearfix">
                    <div className="col-lg-6 col-md-12 col-sm-12 video-column">
                      <div
                        className="video-inner"
                        style={{ backgroundImage: `url(${content.videoImg})` }}
                      >
                        <div className="video-btn">
                          <ModalVideo />
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
                            {content.list.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                          <div className="btn-box">
                            <Link to="/" className="theme-btn btn-two">
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