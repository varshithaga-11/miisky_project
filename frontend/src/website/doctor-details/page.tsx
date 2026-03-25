import Layout from "../components/layout/Layout";
import Image from "../components/Image";
import Cta from "../components/sections/home2/Cta";
import ProgressBar from "../components/elements/ProgressBar";

export default function Doctors_Details() {
  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Doctors Details">
        <section className="team-details pt_120 pb_120">
          <div className="auto-container">
            <div className="team-details-content mb_100">
              <div className="row clearfix">
                {/* Doctor Image */}
                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                  <figure className="image-box">
                    <Image
                      src="/website/assets/images/team/team-7.jpg"
                      alt="Doctor Image"
                      width={633}
                      height={701}
                      priority
                    />
                  </figure>
                </div>

                {/* Doctor Info */}
                <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                  <div className="content-box">
                    <h2>Guy Hawkins</h2>
                    <span className="designation">Cataract surgery</span>
                    <p>
                      Medical research is an important aspect of the field, as
                      it allows for the development of new drugs, treatments,
                      and technologies. Advances in medical research have led to
                      significant improvements in healthcare and increased life
                      expectancy in many parts of the world.
                    </p>
                    <p>
                      Medical professionals include doctors, nurses,
                      pharmacists, and other healthcare workers who work
                      together to provide patient care. They may work in
                      hospitals, clinics, private practices, or other healthcare
                      settings. In summary, medical science is a complex and
                      interdisciplinary field that plays a critical role in
                      maintaining and improving human health.
                    </p>
                    <p>
                      Its practitioners use a range of techniques and
                      technologies to diagnose and treat illnesses and injuries,
                      and medical research is an essential component of
                      advancing healthcare.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Experience */}
            <div className="team-info-box mb_40">
              <div className="row clearfix">
                <div className="col-lg-6 col-md-12 col-sm-12 left-column">
                  <div className="left-content">
                    <h3>Education & Experience</h3>
                    <ul className="education-info clearfix mb_40">
                      <li>
                        <div className="icon-box">
                          <i className="icon-51"></i>
                        </div>
                        <span>Education :</span>
                        Yale-New Haven Hos
                      </li>
                      <li>
                        <div className="icon-box">
                          <i className="icon-52"></i>
                        </div>
                        <span>Board certification :</span>
                        American Board of Surgery - Certified in Surgery
                      </li>
                      <li>
                        <div className="icon-box">
                          <i className="icon-53"></i>
                        </div>
                        <span>Field of expertise :</span>
                        Surgical Critical Care
                      </li>
                      <li>
                        <div className="icon-box">
                          <Image
                            src="/website/assets/images/icons/icon-19.svg"
                            alt="Years of Practice"
                            width={20}
                            height={20}
                          />
                        </div>
                        <span>Years of practice :</span>
                        25+
                      </li>
                    </ul>

                    {/* Skills */}
                    <h3>My Skills</h3>
                    <div className="progress-inner">
                      <ProgressBar label="Empathy" percent={90} />
                      <ProgressBar label="Neurology" percent={95} />
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="col-lg-6 col-md-12 col-sm-12 left-column">
                  <div className="right-column">
                    <h3>Working Hours</h3>
                    <ul className="schedule-list clearfix">
                      <li>
                        Sunday <span>02 pm to 06 pm</span>
                      </li>
                      <li>
                        Monday <span>03 pm to 07 pm</span>
                      </li>
                      <li>
                        Tuesday <span>02 pm to 06 pm</span>
                      </li>
                      <li>
                        Wednesday <span>02 pm to 06 pm</span>
                      </li>
                      <li>
                        Thursday <span>04 pm to 06 pm</span>
                      </li>
                      <li>
                        Friday <span>03 pm to 08 pm</span>
                      </li>
                      <li>
                        Saturday <span>Closed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-box">
              <h3>Contact Me</h3>
              <form method="post" action="/website" className="default-form">
                <div className="row clearfix">
                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <i className="icon-45"></i>
                      </div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <i className="icon-46"></i>
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <Image
                          src="/website/assets/images/icons/icon-18.svg"
                          alt="Phone"
                          width={14}
                          height={15}
                        />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <i className="icon-48"></i>
                      </div>
                      <textarea name="message" placeholder="Message"></textarea>
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group message-btn mx-0">
                      <button type="submit" className="theme-btn btn-two">
                        <span>Send your message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <Cta />
      </Layout>
    </div>
  );
}
