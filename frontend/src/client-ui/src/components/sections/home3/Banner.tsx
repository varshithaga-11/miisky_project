import Image from "@/components/Image";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export default function Banner() {
  return (
    <section className="banner-style-three relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        className="banner-carousel"
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="slide-item relative">
            <div className="bg-layer">
              <Image
                src="/assets/images/banner/banner-2.jpg"
                alt="Banner"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="auto-container">
              <div className="content-box p_relative d_block z_5">
                <span className="title-text p_relative d_block">Your Health is our Priority</span>
                <h2 className="p_relative d_block">Leading the Way in Medical Excellence</h2>
                <p>
                  In addition to treating illnesses and injuries, medical care also
                  emphasizes the importance of preventive care, such as regular
                  check-ups, vaccinations, and lifestyle modifications.
                </p>
                <div className="btn-box">
                  <Link to="/" className="theme-btn btn-two">
                    <span>Explore Our Service</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="slide-item relative style-two">
            <div className="bg-layer">
              <Image
                src="/assets/images/banner/banner-3.jpg"
                alt="Banner"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="auto-container">
              <div className="content-box p_relative d_block z_5">
                <span className="title-text p_relative d_block">Your Health is our Priority</span>
                <h2 className="p_relative d_block">Leading the Way in Medical Excellence</h2>
                <p>
                  In addition to treating illnesses and injuries, medical care also
                  emphasizes the importance of preventive care, such as regular
                  check-ups, vaccinations, and lifestyle modifications.
                </p>
                <div className="btn-box">
                  <Link to="/" className="theme-btn btn-two">
                    <span>Explore Our Service</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
