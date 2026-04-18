import { useState, useEffect } from "react";
import Image from '@website/components/Image';
import { getCompanyInfo } from "@/utils/api";

export default function About_Two() {
  const [activeTab, setActiveTab] = useState(4);
  const [tabContent, setTabContent] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCompanyInfo();
        const info = Array.isArray(response.data) ? response.data[0] : response.data;
        if (info) {
          setTabContent([
            {
              id: 4,
              title: "Vision",
              heading: "Vision",
              paragraph: info.vision_statement || info.mission_statement || "Our vision is to provide accessible and equitable healthcare to all individuals.",
              leftListTitle: "Our Specialities",
              leftList: info.our_specialities || ["Preventive care", "Diagnostic testing", "Mental health services"],
              rightListTitle: "Our Vision",
              rightList: info.our_vision || ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
            },
            {
              id: 5,
              title: "Mission",
              heading: "Mission",
              paragraph: info.mission_statement || "Our mission is to empower patients and use innovative technology to improve health outcomes.",
              leftListTitle: "Our Specialities",
              leftList: info.our_specialities || ["Preventive care", "Diagnostic testing", "Mental health services"],
              rightListTitle: "Our Mission",
              rightList: info.our_vision || ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
            },
            {
              id: 6,
              title: "Strategy",
              heading: "Strategy",
              paragraph: info.strategy_statement || info.mission_statement || "We focus on a patient-centric approach combined with cutting-edge medical research.",
              leftListTitle: "Our Specialities",
              leftList: info.our_specialities || ["Preventive care", "Diagnostic testing", "Mental health services"],
              rightListTitle: "Our Strategy",
              rightList: info.our_vision || ["To provide accessible and equitable", "To use innovative technology", "To empower patients"]
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch company info for tabs:", error);
      }
    };
    fetchData();
  }, []);

  const tabs = tabContent.map(t => ({ id: t.id, title: t.title }));

  if (tabContent.length === 0) return null;

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
                                    {content.leftList.map((item: any, i: number) => <li key={i}>{item}</li>)}
                                  </ul>
                                </div>
                              </div>
                              <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                <div className="specialities-box">
                                  <h4>{content.rightListTitle}</h4>
                                  <ul className="list-style-one clearfix">
                                    {content.rightList.map((item: any, i: number) => <li key={i}>{item}</li>)}
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
                <Image src="/website/assets/images/background/company.jpg" alt="Company" width={636} height={639} />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
