import { Link } from "react-router-dom";
import Image from "@/components/Image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { BannerSlide } from "../../../utils/mockData";
import { MOCK_BANNER_SLIDES } from "../../../utils/mockData";

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
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    320:  { slidesPerView: 1 },
    575:  { slidesPerView: 1 },
    767:  { slidesPerView: 1 },
    991:  { slidesPerView: 1 },
    1199: { slidesPerView: 1 },
    1350: { slidesPerView: 1 },
  },
};

interface BannerProps {
  slides?: BannerSlide[];
  /** Number of doctor thumbnails shown in the social proof strip */
  doctorThumbCount?: number;
  /** Stats text shown below the thumbs */
  statsLabel?: string;
  statsValue?: string;
}

export default function Banner({
  slides = MOCK_BANNER_SLIDES,
  doctorThumbCount = 4,
  statsLabel = "Professional Doctors",
  statsValue = "100K",
}: BannerProps) {
  return (
    <section className="banner-section p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/assets/images/shape/shape-3.png)" }}
      ></div>

      <Swiper {...swiperOptions} className="swiper-container banner-carousel">
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="slide-item p_relative">

              {/* Pattern Layer */}
              <div className="pattern-layer">
                <div className="pattern-1" style={{ backgroundImage: "url(/assets/images/shape/shape-1.png)" }} />
                <div className="pattern-2" style={{ backgroundImage: "url(/assets/images/shape/shape-2.png)" }} />
              </div>

              {/* Shape Layer */}
              <div className="shape-layer">
                <div className="shape-1 float-bob-y" style={{ backgroundImage: "url(/assets/images/shape/shape-3.png)" }} />
                <div className="shape-2" style={{ backgroundImage: "url(/assets/images/shape/shape-4.png)" }} />
                <div className="shape-3" style={{ backgroundImage: "url(/assets/images/shape/shape-5.png)" }} />
                <div className="shape-4" style={{ backgroundImage: "url(/assets/images/shape/shape-6.png)" }} />
              </div>

              {/* Content Box */}
              <div className="auto-container">
                <div className="content-box p_relative d_block z_5">
                  <span className="title-text p_relative d_block">{slide.subTitle}</span>
                  <h2 className="p_relative d_block">
                    {slide.title}<span>{slide.highlight}</span>
                  </h2>
                  <p>{slide.description}</p>
                  <div className="btn-box">
                    <Link to={slide.buttonHref} className="theme-btn btn-two">
                      <span>{slide.buttonLabel}</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Image Box */}
              <div className="image-box">
                <figure className="image">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={711}
                    height={700}
                  />
                </figure>

                {/* Doctor count social proof */}
                <div className="doctors-list">
                  <ul className="thumb-box flex gap-2">
                    {Array.from({ length: doctorThumbCount }, (_, i) => (
                      <li key={i + 1}>
                        <Image
                          src={`/assets/images/banner/thumb-${i + 1}.jpg`}
                          alt={`Doctor ${i + 1}`}
                          width={45}
                          height={45}
                        />
                      </li>
                    ))}
                  </ul>
                  <h3>{statsValue}</h3>
                  <span>{statsLabel}</span>
                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
