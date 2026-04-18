import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from '@website/components/Image';

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Testimonial() {
  return (
    <section className="testimonial-section sec-pad">
      {/* Background pattern */}
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-36.png)" }}
      ></div>

      <div className="auto-container">
        {/* Section Title */}
        <div className="sec-title centred mb_60">
          <span className="sub-title mb_5">Testimonial</span>
          <h2>
            What Our Patient&apos;s Say About <br />
            Miisky
          </h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and
            preventive care for various <br />
            illnesses, injuries, and diseases.
          </p>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={2}
          navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
          autoplay={{ delay: 4000 }}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
          }}
          className="testimonial-swiper"
        >
          {/* Testimonial 1 */}
          <SwiperSlide>
            <div className="testimonial-block-one">
              <div className="inner-box">
                <div className="icon-box">
                  <i className="icon-41"></i>
                </div>
                <div className="author-box">
                  <figure className="author-thumb">
                    <Image
                      src="/website/assets/images/resource/testimonial-1.jpg"
                      alt="Jane Cooper"
                      width={80}
                      height={80}
                    />
                  </figure>
                  <h3>Jane Cooper</h3>
                  <span className="designation">President of Sales</span>
                  <ul className="rating clearfix">
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                  </ul>
                </div>
                <div className="text-box">
                  <p>
                    “The care I received from the medical staff at this hospital
                    was exceptional. They went above and beyond to ensure that I
                    was comfortable, informed, and receiving the best possible
                    treatment.”
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Testimonial 2 */}
          <SwiperSlide>
            <div className="testimonial-block-one">
              <div className="inner-box">
                <div className="icon-box">
                  <i className="icon-41"></i>
                </div>
                <div className="author-box">
                  <figure className="author-thumb">
                    <Image
                      src="/website/assets/images/resource/testimonial-2.jpg"
                      alt="Haris Gulati"
                      width={80}
                      height={80}
                    />
                  </figure>
                  <h3>Haris Gulati</h3>
                  <span className="designation">President of Sales</span>
                  <ul className="rating clearfix">
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                  </ul>
                </div>
                <div className="text-box">
                  <p>
                    “The care I received from the medical staff at this hospital
                    was exceptional. They went above and beyond to ensure that I
                    was comfortable, informed, and receiving the best possible
                    treatment.”
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Testimonial 1 */}
          <SwiperSlide>
            <div className="testimonial-block-one">
              <div className="inner-box">
                <div className="icon-box">
                  <i className="icon-41"></i>
                </div>
                <div className="author-box">
                  <figure className="author-thumb">
                    <Image
                      src="/website/assets/images/resource/testimonial-1.jpg"
                      alt="Jane Cooper"
                      width={80}
                      height={80}
                    />
                  </figure>
                  <h3>Jane Cooper</h3>
                  <span className="designation">President of Sales</span>
                  <ul className="rating clearfix">
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                  </ul>
                </div>
                <div className="text-box">
                  <p>
                    “The care I received from the medical staff at this hospital
                    was exceptional. They went above and beyond to ensure that I
                    was comfortable, informed, and receiving the best possible
                    treatment.”
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Testimonial 2 */}
          <SwiperSlide>
            <div className="testimonial-block-one">
              <div className="inner-box">
                <div className="icon-box">
                  <i className="icon-41"></i>
                </div>
                <div className="author-box">
                  <figure className="author-thumb">
                    <Image
                      src="/website/assets/images/resource/testimonial-2.jpg"
                      alt="Haris Gulati"
                      width={80}
                      height={80}
                    />
                  </figure>
                  <h3>Haris Gulati</h3>
                  <span className="designation">President of Sales</span>
                  <ul className="rating clearfix">
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                    <li>
                      <i className="icon-42"></i>
                    </li>
                  </ul>
                </div>
                <div className="text-box">
                  <p>
                    “The care I received from the medical staff at this hospital
                    was exceptional. They went above and beyond to ensure that I
                    was comfortable, informed, and receiving the best possible
                    treatment.”
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
          {/* Optional navigation buttons */}
          <div className="nav-style-one">
            <div className="swiper-nav">
                <button type="button" className="swiper-prev"><span className="icon-21"></span></button>
                <button type="button" className="swiper-next"><span className="icon-22"></span></button>
            </div>
        </div>
        </Swiper>
      </div>
    </section>
  );
}
