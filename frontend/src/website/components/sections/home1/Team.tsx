import Image from "../../Image";
import { Link } from "react-router-dom";
import type { Doctor } from "../../../utils/types";
import { MOCK_DOCTORS } from "../../../utils/mockData";

interface TeamProps {
  /** Pass real API doctors here; falls back to mock data */
  doctors?: Doctor[];
}

export default function Team({ doctors = MOCK_DOCTORS }: TeamProps) {
  // Only show first 3 on the homepage
  const featured = doctors.slice(0, 3);

  return (
    <section className="team-section sec-pad centred">
      <div className="bg-layer" style={{ backgroundImage: "url(/website/assets/images/background/team-bg.jpg)" }}></div>
      <div className="auto-container">
        <div className="sec-title mb_60">
          <span className="sub-title mb_5">Our Team</span>
          <h2>The Most Qualified Skillful &<br />Professional staff</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and preventive care for various{" "}
            <br />illnesses, injuries, and diseases.
          </p>
        </div>
        <div className="row clearfix">
          {featured.map((doctor, idx) => (
            <div key={doctor.id} className="col-lg-4 col-md-6 col-sm-12 team-block">
              <div
                className="team-block-one wow fadeInUp animated"
                data-wow-delay={`${idx * 300}ms`}
                data-wow-duration="1500ms"
              >
                <div className="inner-box">
                  <figure className="image-box">
                    <Link to={`/website/doctor-details?id=${doctor.id}`}>
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
                      <Link to={`/website/doctor-details?id=${doctor.id}`}>{doctor.name}</Link>
                    </h3>
                    <span className="designation">{doctor.specialty}</span>
                    <ul className="social-links clearfix">
                      <li><Link to="/website"><i className="fab fa-facebook-f"></i></Link></li>
                      <li><Link to="/website"><i className="fab fa-twitter"></i></Link></li>
                      <li><Link to="/website"><i className="fab fa-dribbble"></i></Link></li>
                      <li><Link to="/website"><i className="fab fa-behance"></i></Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
