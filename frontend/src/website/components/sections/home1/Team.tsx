import Image from "../../Image";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTeamMembers } from "@/utils/api";
import type { Doctor } from "@/Website/utils/types";
import { MOCK_DOCTORS } from "@/Website/utils/mockData";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
    nextEl: ".swiper-button-next-team",
    prevEl: ".swiper-button-prev-team",
  },
  pagination: {
    el: ".swiper-pagination-team",
    clickable: true,
  },
  breakpoints: {
    320: { slidesPerView: 1 },
    575: { slidesPerView: 1 },
    767: { slidesPerView: 2 },
    991: { slidesPerView: 3 },
    1200: { slidesPerView: 3 },
  },
};

interface TeamProps {
  /** Pass real API doctors here; falls back to mock data */
  doctors?: Doctor[];
}

export default function Team({ doctors }: TeamProps) {
  const [teamMembers, setTeamMembers] = useState<Doctor[]>(doctors || MOCK_DOCTORS);
  const [loading, setLoading] = useState(!doctors);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doctors) {
      setTeamMembers(doctors);
      setLoading(false);
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await getTeamMembers();
        const data = response.data;

        // Handle both array and paginated responses
        const members = Array.isArray(data) ? data : data.results || data;
        const formattedMembers = members.map((member: any) => ({
          id: member.id,
          name: member.name || "Unknown",
          specialty: member.designation || "Specialist",
          department: member.department?.name || "Medical",
          image: member.photo_url || member.photo || member.image_url || member.image || "/website/assets/images/team/team-1.jpg",
          bio: member.bio || "",
          available: member.available !== false,
        }));

        setTeamMembers(formattedMembers.length > 0 ? formattedMembers : MOCK_DOCTORS);
        setError(null);
      } catch (err) {
        console.warn("Failed to fetch team members, using mock data:", err);
        setTeamMembers(MOCK_DOCTORS);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [doctors]);

  if (loading && !doctors) return <div className="sec-pad centred"><div className="auto-container"><h3>Loading...</h3></div></div>;
  if (error && !doctors) return <div className="sec-pad centred"><div className="auto-container"><h3>{error}</h3></div></div>;

  return (
    <section className="team-section sec-pad centred p_relative">
      <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-8.png)" }}></div>
      <div className="auto-container">
        <div className="sec-title mb_60">
          <span className="sub-title mb_5">Our Team</span>
          <h2>The Most Qualified Skillful &<br />Professional staff</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and preventive care for various{" "}
            <br />illnesses, injuries, and diseases.
          </p>
        </div>

        <div className="team-carousel-container p_relative">
          <Swiper {...swiperOptions} className="team-carousel">
            {teamMembers.map((doctor) => (
              <SwiperSlide key={doctor.id}>
                <div
                  className="team-block-one"
                >
                  <div className="inner-box">
                    <figure className="image-box">
                      <Link to={`/doctor-details/${doctor.id}`}>
                        <Image
                          src={doctor.image || "/website/assets/images/team/team-1.jpg"}
                          alt={doctor.name}
                          width={416}
                          height={430}
                          priority
                        />
                      </Link>
                    </figure>
                    <div className="content-box">
                      <h3>
                        <Link to={`/doctor-details/${doctor.id}`}>{doctor.name}</Link>
                      </h3>
                      <span className="designation">{doctor.specialty}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation and Pagination */}
          <div className="swiper-pagination-team mt_40"></div>
          
          <div className="nav-style-one section-nav">
             <div className="swiper-button-prev-team swiper-prev"><span className="icon-21"></span></div>
             <div className="swiper-button-next-team swiper-next"><span className="icon-22"></span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

