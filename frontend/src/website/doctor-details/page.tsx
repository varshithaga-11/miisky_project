import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Image from '@website/components/Image';
import { useLayout } from '@website/context/LayoutContext';
import Cta from '@website/components/sections/home2/Cta';
import { getTeamMemberById } from '@/utils/api';
import { contactApi } from '@website/utils/api';
import { MOCK_DOCTORS } from "../utils/mockData";
import { toast } from "react-toastify";

export default function DoctorsDetails() {
  const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(MOCK_DOCTORS[0] || {});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    subject: `Inquiry for ${doctor.name || 'Medical Professional'}`
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setHeaderStyle(1);
    setBreadcrumbTitle("Doctor Details");
  }, [setHeaderStyle, setBreadcrumbTitle]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (uid) {
          const response = await getTeamMemberById(uid);
          const doctorData = response.data || MOCK_DOCTORS[0];
          setDoctor(doctorData);
          setBreadcrumbTitle(doctorData.name || "Doctor Details");
        } else {
          setDoctor(MOCK_DOCTORS[0]);
          setBreadcrumbTitle(MOCK_DOCTORS[0].name || "Doctor Details");
        }
      } catch (err) {
        console.warn('Failed to fetch doctor:', err);
        const fallbackDoctor = MOCK_DOCTORS[0];
        setDoctor(fallbackDoctor);
        setBreadcrumbTitle(fallbackDoctor.name || "Doctor Details");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [uid, setBreadcrumbTitle]);

  useEffect(() => {
    if (doctor?.uid && String(uid) === String(doctor.id)) {
      navigate(`/doctor-details/${doctor.uid}`, { replace: true });
    }
  }, [doctor, uid, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await contactApi.send({
        ...formData,
        subject: `Inquiry regarding Doctor: ${doctor.name || 'General'}`
      });
      setSubmitStatus("success");
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "", subject: "" });
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error("Failed to send message. Please try again.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

  return (
    <div className="boxed_wrapper">
        <section className="team-details pt_120 pb_120">
          <div className="auto-container">
            <div className="team-details-content mb_100">
              <div className="row clearfix">
                {/* Doctor Image */}
                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                  <figure className="image-box">
                    <Image
                      src={doctor.photo_url || doctor.photo || doctor.image_url || doctor.image || doctor.profile_image || "/website/assets/images/team/team-7.jpg"}
                      alt={doctor.name}
                      width={633}
                      height={701}
                      priority
                    />
                  </figure>
                </div>

                {/* Doctor Info */}
                <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                  <div className="content-box">
                    <h2>{doctor.name || "Medical Professional"}</h2>
                    <span className="designation">{doctor.tagline || doctor.designation || "Healthcare Expert"}</span>
                    <p>{doctor.bio || "Professional medical expertise and dedication to patient care"}</p>
                    <p>{doctor.expertise_text || "Medical professionals include doctors, nurses, pharmacists, and other healthcare workers who work together to provide patient care. They may work in hospitals, clinics, private practices, or other healthcare settings."}</p>
                    <p>{doctor.detailed_description || "Their practitioners use a range of techniques and technologies to diagnose and treat illnesses and injuries, and medical research is an essential component of advancing healthcare."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 
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
                        {doctor.education || "Advanced Medical Education"}
                      </li>
                      <li>
                        <div className="icon-box">
                          <i className="icon-52"></i>
                        </div>
                        <span>Board certification :</span>
                        {doctor.certification || "Board Certified"}
                      </li>
                      <li>
                        <div className="icon-box">
                          <i className="icon-53"></i>
                        </div>
                        <span>Field of expertise :</span>
                        {doctor.specialization || "General Medicine"}
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
                        {doctor.years_of_experience || "20+"}
                      </li>
                    </ul>

                    <h3>My Skills</h3>
                    <div className="progress-inner">
                      <ProgressBar label="Empathy" percent={90} />
                      <ProgressBar label={doctor.specialization || "Expertise"} percent={95} />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 left-column">
                  <div className="right-column">
                    <h3>Working Hours</h3>
                    <ul className="schedule-list clearfix">
                      <li>
                        Monday <span>{doctor.monday_hours || "09 am to 05 pm"}</span>
                      </li>
                      <li>
                        Tuesday <span>{doctor.tuesday_hours || "09 am to 05 pm"}</span>
                      </li>
                      <li>
                        Wednesday <span>{doctor.wednesday_hours || "09 am to 05 pm"}</span>
                      </li>
                      <li>
                        Thursday <span>{doctor.thursday_hours || "09 am to 05 pm"}</span>
                      </li>
                      <li>
                        Friday <span>{doctor.friday_hours || "09 am to 05 pm"}</span>
                      </li>
                      <li>
                        Saturday <span>{doctor.saturday_hours || "10 am to 02 pm"}</span>
                      </li>
                      <li>
                        Sunday <span>{doctor.sunday_hours || "Closed"}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            */}

            {/* Contact Form */}
            <div className="contact-box">
              <h3>Contact Me</h3>
              <form onSubmit={handleSubmit} className="default-form">
                <div className="row clearfix">
                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <i className="icon-45"></i>
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
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
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email (Optional)"
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
                        value={formData.phone}
                        onChange={handleInputChange}
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
                      <textarea 
                        name="message" 
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Message"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group message-btn mx-0">
                      <button type="submit" className="theme-btn btn-two" disabled={isSubmitting}>
                        <span>{isSubmitting ? "Sending..." : "Send your message"}</span>
                      </button>
                    </div>
                  </div>
                </div>
                {submitStatus === "error" && (
                    <div className="mt-3 text-danger">Failed to send message. Please try again.</div>
                )}
              </form>
            </div>
          </div>
        </section>

        <Cta />
    </div>
  );
}
