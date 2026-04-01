import { useEffect, useState } from "react";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import Cta from "../components/sections/home2/Cta";
import Appointment from "../components/sections/home1/Appointment";
import { getPricingPlans, getFAQs } from "@/utils/api";

const MOCK_PLANS = [
    {
        id: 1,
        name: "Basic Plan",
        price: "25.00",
        period: "monthly",
        savings_text: "Save 25%",
        features: ["COVID-19", "Eye Infections", "Senior Care", "Cardiology", "Family"],
        icon_class: "icon-20",
        is_popular: false
    },
    {
        id: 2,
        name: "Silver Plan",
        price: "50.00",
        period: "monthly",
        savings_text: "Save 30%",
        features: ["COVID-19", "Eye Infections", "Senior Care", "Cardiology", "Family"],
        icon_class: "icon-20",
        is_popular: true
    },
    {
        id: 3,
        name: "Gold Plan",
        price: "65.00",
        period: "monthly",
        savings_text: "Save 20%",
        features: ["COVID-19", "Eye Infections", "Senior Care", "Cardiology", "Family"],
        icon_class: "icon-20",
        is_popular: false
    }
];

export default function Pricing_Page() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
    const [plans, setPlans] = useState<any[]>(MOCK_PLANS);
    const [faqs, setFaqs] = useState<any[]>([]);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Pricing");

        const fetchData = async () => {
            try {
                const planRes = await getPricingPlans();
                const planData = Array.isArray(planRes.data) ? planRes.data : planRes.data.results || [];
                if (planData.length > 0) setPlans(planData);

                const faqRes = await getFAQs();
                const faqData = Array.isArray(faqRes.data) ? faqRes.data : faqRes.data.results || [];
                setFaqs(faqData);
            } catch (error) {
                console.error("Failed to fetch pricing or faqs:", error);
            }
        };
        fetchData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="boxed_wrapper">
            <section className="pricing-section pt_120 pb_90">
                <div className="auto-container">
                    <div className="row clearfix">
                        {plans.map((plan, index) => (
                            <div key={plan.id || index} className="col-lg-4 col-md-6 col-sm-12 pricing-block">
                                <div className="pricing-block-one wow fadeInUp animated" data-wow-delay={`${index * 300}ms`} data-wow-duration="1500ms">
                                    <div className="pricing-table">
                                        {plan.is_popular && <span className="popular-tags">Popular</span>}
                                        <div className="table-header centred">
                                            <div className="title-box">
                                                <div className="icon-box">
                                                    <i className={plan.icon_class || "icon-20"} style={{ fontSize: '50px', color: '#1a4966' }}></i>
                                                </div>
                                                <h3>{plan.name}</h3>
                                                <span>{plan.savings_text}</span>
                                            </div>
                                            <div className="price-box">
                                                <h2>{plan.price} <span className="symble">$</span> <span className="text">{plan.period}</span></h2>
                                            </div>
                                        </div>
                                        <div className="table-content">
                                            <div className="btn-box"><Link to="/pricing" className="theme-btn btn-one">Choose Plan +</Link></div>
                                            <ul className="feature-list clearfix">
                                                {(plan.features || []).map((feature: string, fIdx: number) => (
                                                    <li key={fIdx}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                          {faqs.length > 0 ? faqs.map((item: any, index: number) => (
                            <li
                              key={item.id || index}
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
                                  {item.question}
                                </h4>
                              </div>
        
                              {activeIndex === index && (
                                <div className="acc-content current">
                                  <p>{item.answer}</p>
                                </div>
                              )}
                            </li>
                          )) : [
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
    </div>
  );
}
