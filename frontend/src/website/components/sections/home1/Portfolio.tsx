import { Link } from "react-router-dom";
import Image from "../../Image";
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const portfolioItems = [
  {
    img: '/website/assets/images/gallery/portfolio-1.jpg',
    title: 'Regular Dental Cleaning',
    category: 'Residential',
  },
  {
    img: '/website/assets/images/gallery/portfolio-2.jpg',
    title: 'Prepare to Speak',
    category: 'Residential',
  },
  {
    img: '/website/assets/images/gallery/portfolio-3.jpg',
    title: 'From Diagnosis',
    category: 'Residential',
  },
  {
    img: '/website/assets/images/gallery/portfolio-4.jpg',
    title: 'Empowering Patients',
    category: 'Residential',
  },
  {
    img: '/website/assets/images/gallery/portfolio-1.jpg',
    title: 'Regular Dental Cleaning',
    category: 'Residential',
  },
  {
    img: '/website/assets/images/gallery/portfolio-2.jpg',
    title: 'Prepare to Speak',
    category: 'Residential',
  },
  {
    img: '/website/assets/images/gallery/portfolio-3.jpg',
    title: 'From Diagnosis',
    category: 'Residential',
  },
  {
    img: '/website/assets/images/gallery/portfolio-4.jpg',
    title: 'Empowering Patients',
    category: 'Residential',
  },
];

export default function Portfolio() {
  return (
    <section className="portfolio-section">
      <div className="outer-container">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          spaceBetween={0}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            320: { slidesPerView: 1 },
            575: { slidesPerView: 2 },
            767: { slidesPerView: 2 },
            991: { slidesPerView: 3 },
            1199: { slidesPerView: 3 },
            1350: { slidesPerView: 4 },
          }}
        >
          {portfolioItems.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="portfolio-block-one">
                <div className="inner-box">
                  <figure className="image-box">
                    <Image src={item.img} alt={item.title} width={400} height={300} />
                  </figure>
                  <div className="view-btn">
                    <a href={item.img} className="lightbox-image" data-fancybox="gallery">
                      <i className="icon-24"></i>
                    </a>
                  </div>
                  <div className="text-box">
                    <h3>
                      <Link to="#"> {item.title} </Link>
                    </h3>
                    <span>{item.category}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
