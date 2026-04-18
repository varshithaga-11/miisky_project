import { useState } from "react";
import Image from '@website/components/Image';

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section p_relative sec-pad">
      {/* Background Shape */}
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-13.png)" }}
      ></div>

      <div className="auto-container">
        <div className="row clearfix">
          {/* Left Image */}
          <div className="col-lg-6 col-md-12 col-sm-12 image-column">
            <div className="image_block_four">
              <div className="image-box">
                <div
                  className="image-shape"
                  style={{
                    backgroundImage: "url(/website/assets/images/shape/shape-33.png)",
                  }}
                ></div>
                <figure className="image">
                  <Image
                    src="/website/assets/images/resource/faq-1.jpg"
                    alt="FAQ"
                    width={500}
                    height={600}
                  />
                </figure>
                <div className="experience-box">
                  <div className="inner">
                    <h2>30</h2>
                    <span>Years of Experience in This Field</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="col-lg-6 col-md-12 col-sm-12 content-column">
            <div className="content_block_five">
              <div className="content-box ml_100">
                <div className="sec-title mb_30">
                  <span className="sub-title mb_5">About the company</span>
                  <h2>Health service for you</h2>
                  <p>
                    The medical professionals who treated me showed unmatched
                    expertise, compassion, and dedication. Their care and support
                    helped me overcome a serious health challenge and get back
                    to living my life.
                  </p>
                </div>

                {/* Accordion */}
                <ul className="accordion-box">
                  {[
                    {
                      title: "Emergency Departments",
                      content:
                        "The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life.",
                    },
                    {
                      title: "Covid-19 Testing Clinics",
                      content:
                        "The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life.",
                    },
                    {
                      title: "GP (General practice)",
                      content:
                        "The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life.",
                    },
                  ].map((item, index) => (
                    <li
                      key={index}
                      className={`accordion block ${
                        activeIndex === index ? "active-block" : ""
                      }`}
                    >
                      <div
                        className={`acc-btn ${
                          activeIndex === index ? "active" : ""
                        }`}
                        onClick={() => toggleAccordion(index)}
                      >
                        <div className="icon-box">
                          <i className="icon-22"></i>
                        </div>
                        <h4>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          {item.title}
                        </h4>
                      </div>

                      {activeIndex === index && (
                        <div className="acc-content current">
                          <p>{item.content}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
