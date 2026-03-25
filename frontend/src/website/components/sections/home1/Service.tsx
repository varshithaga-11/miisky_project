import { Link } from "react-router-dom";
import Image from "../../Image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Department } from "../../../utils/types";
import { MOCK_DEPARTMENTS, DEPARTMENT_SLUGS } from "../../../utils/mockData";

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  slidesPerView: 1,
  spaceBetween: 30,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  loop: true,
  navigation: {
    nextEl: ".swiper-prev",
    prevEl: ".swiper-next",
  },
  breakpoints: {
    320:  { slidesPerView: 1 },
    575:  { slidesPerView: 1 },
    767:  { slidesPerView: 2 },
    991:  { slidesPerView: 2 },
    1199: { slidesPerView: 3 },
    1350: { slidesPerView: 3 },
  },
};

interface ServiceProps {
  departments?: Department[];
}

export default function Service({ departments = MOCK_DEPARTMENTS }: ServiceProps) {
  return (
    <section className="service-section p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-13.png)" }}
      ></div>
      <span className="big-text">Central Hospital Central Hospital</span>
      <div className="auto-container">
        <div className="sec-title mb_60">
          <span className="sub-title mb_5">What we do for our patients</span>
          <h2>Our Medical Departments Services</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and
            preventive care for various illnesses, injuries, and diseases. It
            involves a wide range of healthcare professionals such as doctors,
            nurses, pharmacists, therapists, and many more, who work together to
            provide the best possible care for patients.
          </p>
        </div>

        <Swiper {...swiperOptions} className="three-item-carousel owl-theme nav-style-one">
          {departments.map((dept) => (
            <SwiperSlide key={dept.id}>
              <div className="service-block-one">
                <div className="inner-box">
                  <figure className="image-box">
                    <Image
                      src={dept.image || "/website/assets/images/service/service-1.jpg"}
                      alt={dept.name}
                      width={416}
                      height={358}
                    />
                  </figure>
                  <div className="lower-content">
                    <div className="inner">
                      <div className="icon-box">
                        <i className={dept.icon || "icon-18"}></i>
                      </div>
                      <h3>
                        <Link to={DEPARTMENT_SLUGS[dept.id] || "/website/departments"}>
                          {dept.name}
                        </Link>
                      </h3>
                      <p>{dept.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="nav-style-one">
          <div className="swiper-nav">
            <button type="button" className="swiper-prev">
              <span className="icon-21"></span>
            </button>
            <button type="button" className="swiper-next">
              <span className="icon-22"></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
