import { Link } from "react-router-dom";
import Image from "../../Image";
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useState } from "react";
import { getGalleryItems } from "@/utils/api";

interface PortfolioItem {
  id: number;
  img: string;
  title: string;
  category: string;
}

const defaultPortfolioItems: PortfolioItem[] = [
  {
    id: 1,
    img: '/website/assets/images/gallery/portfolio-1.jpg',
    title: 'Regular Dental Cleaning',
    category: 'Residential',
  },
  {
    id: 2,
    img: '/website/assets/images/gallery/portfolio-2.jpg',
    title: 'Prepare to Speak',
    category: 'Residential',
  },
  {
    id: 3,
    img: '/website/assets/images/gallery/portfolio-3.jpg',
    title: 'From Diagnosis',
    category: 'Residential',
  },
  {
    id: 4,
    img: '/website/assets/images/gallery/portfolio-4.jpg',
    title: 'Empowering Patients',
    category: 'Residential',
  },
];

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(defaultPortfolioItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        const response = await getGalleryItems();
        const data = response.data;

        // Handle both array and paginated responses
        const items = Array.isArray(data) ? data : data.results || data;
        const formattedItems = items.map((item: any) => ({
          id: item.id,
          img: item.image_url || item.image || '/website/assets/images/gallery/portfolio-1.jpg',
          title: item.title || item.name || "Gallery Item",
          category: item.category?.name || item.category || "Gallery",
        }));

        setPortfolioItems(formattedItems.length > 0 ? formattedItems : defaultPortfolioItems);
        setError(null);
      } catch (err) {
        console.warn("Failed to fetch gallery items, using default portfolio items:", err);
        setPortfolioItems(defaultPortfolioItems);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);
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
