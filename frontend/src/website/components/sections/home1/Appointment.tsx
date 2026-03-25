import Image from "../../Image";
import { useState, FormEvent } from "react";
import { appointmentApi } from "../../../utils/api";
import { CLINIC_INFO } from "../../../utils/mockData";

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
}

interface AppointmentProps {
  /** Phone number shown in the emergency call card */
  phone?: string;
}

export default function Appointment({ phone = CLINIC_INFO.phone }: AppointmentProps) {
  const [formData, setFormData] = useState<AppointmentData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await appointmentApi.create(formData);
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", date: "", message: "" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <section className="appointment-section">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-17.png)" }}
      ></div>
      <figure className="image-layer">
        <Image
          src="/website/assets/images/resource/women-1.png"
          alt="Appointment"
          width={488}
          height={591}
          priority
        />
      </figure>
      <div className="outer-container clearfix">
        {/* ── Left: Call-to-action ── */}
        <div className="left-column">
          <div
            className="bg-layer"
            style={{ backgroundImage: "url(/website/assets/images/background/appointment-bg.jpg)" }}
          ></div>
          <div className="content-box">
            <div className="icon-box">
              <Image
                src="/website/assets/images/icons/icon-4.svg"
                alt="Icon"
                width={88}
                height={88}
                priority
              />
            </div>
            <h3>Need a Doctor for Check-up? Call for an Emergency Service!</h3>
            <span>
              <a href={`tel:${phone.replace(/\s|\(|\)|-/g, "")}`}>Call: {phone}</a>
            </span>
          </div>
        </div>

        {/* ── Right: Appointment form ── */}
        <div className="right-column">
          <div className="form-inner">
            <div
              className="shape"
              style={{ backgroundImage: "url(/website/assets/images/shape/shape-16.png)" }}
            ></div>
            <h3>Make an Appointment</h3>

            {status === "success" ? (
              <div style={{ padding: "20px 0", color: "green" }}>
                <p>✅ Your appointment request was received! We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="icon"><i className="icon-45"></i></div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <div className="icon"><i className="icon-46"></i></div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="form-group">
                  <div className="icon"><i className="icon-47"></i></div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    required
                  />
                </div>
                <div className="form-group">
                  <div className="icon"><i className="icon-48"></i></div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="Preferred Date"
                  />
                </div>
                <div className="form-group">
                  <div className="icon"><i className="icon-48"></i></div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Message (optional)"
                  />
                </div>

                {status === "error" && (
                  <p style={{ color: "red", marginBottom: "8px" }}>
                    {errorMsg || "Something went wrong. Please try again."}
                  </p>
                )}

                <div className="message-btn">
                  <button
                    type="submit"
                    className="theme-btn btn-two"
                    disabled={status === "loading"}
                  >
                    <span>{status === "loading" ? "Submitting..." : "Send your message"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
