import { useState } from "react";
import Image from "../../Image";

export default function About_Two() {
  const [activeTab, setActiveTab] = useState(4);

  const tabs = [
    { id: 4, title: "Vision" },
    { id: 5, title: "Mission" },
    { id: 6, title: "Strategy" },
  ];

  const tabContent = [
    {
      id: 4,
      heading: "Vision",
      paragraph: "The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me",
      leftListTitle: "Our Specialities",
      leftList: ["Preventive care", "Diagnostic testing", "Mental health services"],
      rightListTitle: "Our Vision",
      rightList: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
    },
    {
      id: 5,
      heading: "Mission",
      paragraph: "The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me",
      leftListTitle: "Our Specialities",
      leftList: ["Preventive care", "Diagnostic testing", "Mental health services"],
      rightListTitle: "Our Mission",
      rightList: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
    },
    {
      id: 6,
      heading: "Strategy",
      paragraph: "The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me",
      leftListTitle: "Our Specialities",
      leftList: ["Preventive care", "Diagnostic testing", "Mental health services"],
      rightListTitle: "Our Strategy",
      rightList: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
    },
  ];

  return (
    <section className="about-style-two pt_140">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-20.png)" }}
      ></div>
      <div className="auto-container">
        <div className="row clearfix">
          {/* Content Column */}
          <div className="col-lg-6 col-md-12 col-sm-12 content-column">
            <div className="content_block_three">
              <div className="content-box">
                <div className="sec-title mb_15">
                  <span className="sub-title mb_5">About the company</span>
                  <h2>Expertise and <br />compassion saved my life</h2>
                </div>
                <div className="text-box mb_30">
                  <p>The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.</p>
                </div>

                {/* Tabs Buttons */}
                <div className="tabs-box">
                  <div className="tab-btns tab-buttons clearfix mb_30">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? "active-btn" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>

                  {/* Tabs Content */}
                  <div className="tabs-content">
                    {tabContent.map(content => (
                      <div
                        key={content.id}
                        className={`tab ${activeTab === content.id ? "active-tab" : ""}`}
                      >
                        <div className="inner-box">
                          <p>{content.paragraph}</p>
                          <div className="list-inner">
                            <div className="row clearfix">
                              <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                <div className="specialities-box">
                                  <h4>{content.leftListTitle}</h4>
                                  <ul className="list-style-one clearfix">
                                    {content.leftList.map((item, i) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>
                              </div>
                              <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                <div className="specialities-box">
                                  <h4>{content.rightListTitle}</h4>
                                  <ul className="list-style-one clearfix">
                                    {content.rightList.map((item, i) => <li key={i}>{item}</li>)}
                                  </ul>
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
            </div>
          </div>

          {/* Image Column */}
          <div className="col-lg-6 col-md-12 col-sm-12 image-column">
            <div className="image-box">
              <div
                className="image-shape"
                style={{ backgroundImage: "url(/website/assets/images/shape/shape-19.png)" }}
              ></div>
              <figure className="image">
                <Image src="/website/assets/images/resource/about-2.jpg" alt="About" width={636} height={639} />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
