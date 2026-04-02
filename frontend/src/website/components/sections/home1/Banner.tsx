import Image from "../../Image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useState } from "react";
import { getHeroBanners } from "@/utils/api";
import type { BannerSlide } from "@/Website/utils/mockData";
import { MOCK_BANNER_SLIDES } from "@/Website/utils/mockData";

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
}

export default function Banner({
  slides,
}: BannerProps) {
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(MOCK_BANNER_SLIDES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slides) {
      setBannerSlides(slides);
      setLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getHeroBanners();
        const data = response.data;

        // Handle both array and paginated responses
        const banners = Array.isArray(data) ? data : data.results || data;
        const formattedBanners = banners.map((banner: any) => ({
          id: banner.id,
          title: banner.title || "Welcome to Our Hospital",
          subtitle: banner.subtitle || "Quality Healthcare Services",
          highlight: banner.highlight || "For Better Future",
          description: banner.description || "Experience world-class medical care",
          image: banner.background_image_url || banner.background_image || "/website/assets/images/banner/banner-1.jpg",
          buttonLabel: "Appointment",
          buttonHref: "/",
        }));

        if (formattedBanners.length > 0) {
          setBannerSlides(formattedBanners);
        } else {
          setBannerSlides(MOCK_BANNER_SLIDES);
        }
      } catch (err) {
        console.warn("Failed to fetch banners, using mock data:", err);
        setBannerSlides(MOCK_BANNER_SLIDES);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [slides]);

  if (loading && bannerSlides === MOCK_BANNER_SLIDES) {
    return <div className="banner-section p_relative">Loading...</div>;
  }

  return (
    <section className="banner-section p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-3.png)" }}
      ></div>

      <Swiper {...swiperOptions} className="swiper-container banner-carousel">
        {bannerSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="slide-item p_relative">

              {/* Pattern Layer */}
              <div className="pattern-layer">
                <div className="pattern-1" style={{ backgroundImage: "url(/website/assets/images/shape/shape-1.png)" }} />
                <div className="pattern-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-2.png)" }} />
              </div>

              {/* Shape Layer */}
              <div className="shape-layer">
                <div className="shape-1 float-bob-y" style={{ backgroundImage: "url(/website/assets/images/shape/shape-3.png)" }} />
                <div className="shape-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-4.png)" }} />
                <div className="shape-3" style={{ backgroundImage: "url(/website/assets/images/shape/shape-5.png)" }} />
                <div className="shape-4" style={{ backgroundImage: "url(/website/assets/images/shape/shape-6.png)" }} />
              </div>

              {/* Content Box */}
              <div className="auto-container">
                <div className="content-box p_relative d_block z_5">
                  <span className="title-text p_relative d_block">{slide.subTitle}</span>
                  <h2 className="p_relative d_block">
                    {slide.title}<span>{slide.highlight}</span>
                  </h2>
                  <p>{slide.description}</p>
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
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
