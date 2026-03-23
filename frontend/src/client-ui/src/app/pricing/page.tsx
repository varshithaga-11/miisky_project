import { useState } from "react";
import Layout from "../../../components/layout/Layout";
import Image from "@/components/Image";
import { Link } from "react-router-dom";
import Cta from "../../../components/sections/home2/Cta";
import Appointment from "../../../components/sections/home1/Appointment";

export default function Portfolio_Page() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };
  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Pricing">
        <section className="pricing-section pt_120 pb_90">
            <div className="auto-container">
                <div className="row clearfix">
                    <div className="col-lg-4 col-md-6 col-sm-12 pricing-block">
                        <div className="pricing-block-one wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms">
                            <div className="pricing-table">
                                <div className="table-header centred">
                                    <div className="title-box">
                                        <div className="icon-box"><Image src="/assets/images/icons/icon-20.svg" alt="Icon" width={51} height={79} priority /></div>
                                        <h3>Basic Plan</h3>
                                        <span>Save 25%</span>
                                    </div>
                                    <div className="price-box">
                                        <h2>25.00 <span className="symble">$</span> <span className="text">monthly</span></h2>
                                    </div>
                                </div>
                                <div className="table-content">
                                    <div className="btn-box"><Link to="/pricing" className="theme-btn btn-one">Choose Plan +</Link></div>
                                    <ul className="feature-list clearfix">
                                        <li>COVID-19</li>
                                        <li>Eye Infections</li>
                                        <li>Senior Care</li>
                                        <li>Cardiology</li>
                                        <li>Family</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 pricing-block">
                        <div className="pricing-block-one wow fadeInUp animated" data-wow-delay="300ms" data-wow-duration="1500ms">
                            <div className="pricing-table">
                                <span className="popular-tags">Popular</span>
                                <div className="table-header centred">
                                    <div className="title-box">
                                        <div className="icon-box"><Image src="/assets/images/icons/icon-20.svg" alt="Icon" width={51} height={79} priority /></div>
                                        <h3>Silver Plan</h3>
                                        <span>Save 30%</span>
                                    </div>
                                    <div className="price-box">
                                        <h2>50.00 <span className="symble">$</span> <span className="text">monthly</span></h2>
                                    </div>
                                </div>
                                <div className="table-content">
                                    <div className="btn-box"><Link to="/pricing" className="theme-btn btn-one">Choose Plan +</Link></div>
                                    <ul className="feature-list clearfix">
                                        <li>COVID-19</li>
                                        <li>Eye Infections</li>
                                        <li>Senior Care</li>
                                        <li>Cardiology</li>
                                        <li>Family</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 pricing-block">
                        <div className="pricing-block-one wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms">
                            <div className="pricing-table">
                                <div className="table-header centred">
                                    <div className="title-box">
                                        <div className="icon-box"><Image src="/assets/images/icons/icon-20.svg" alt="Icon" width={51} height={79} priority /></div>
                                        <h3>Gold Plan</h3>
                                        <span>Save 20%</span>
                                    </div>
                                    <div className="price-box">
                                        <h2>65.00 <span className="symble">$</span> <span className="text">monthly</span></h2>
                                    </div>
                                </div>
                                <div className="table-content">
                                    <div className="btn-box"><Link to="/pricing" className="theme-btn btn-one">Choose Plan +</Link></div>
                                    <ul className="feature-list clearfix">
                                        <li>COVID-19</li>
                                        <li>Eye Infections</li>
                                        <li>Senior Care</li>
                                        <li>Cardiology</li>
                                        <li>Family</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <Appointment />
        <section className="faq-section pricing-page p_relative sec-pad">
        
              <div className="auto-container">
                <div className="row clearfix">
                  {/* Left Image */}
                  <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                    <div className="image_block_four">
                      <div className="image-box">
                        <figure className="image">
                          <Image
                            src="/assets/images/resource/faq-1.jpg"
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
        <Cta />
      </Layout>
    </div>
  );
}
