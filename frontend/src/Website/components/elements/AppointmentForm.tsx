import { useState } from "react";
import { contactApi } from "../../utils/api";
import Image from "../Image";

interface AppointmentFormProps {
  departmentName?: string;
}

export default function AppointmentForm({ departmentName }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await contactApi.send({
        ...formData,
        subject: `Appointment Inquiry: ${departmentName || "General"}`
      });
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="appointment-form-wrapper">
      <form onSubmit={handleSubmit} className="default-form">
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
        {/* Only show Phone if we want to expand for the sidebar version specifically */}
        <div className="form-group">
          <div className="icon">
            <Image src="/website/assets/images/icons/icon-15.svg" alt="Phone" width={15} height={15} />
          </div>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone (Optional)"
          />
        </div>
        <div className="form-group">
          <div className="icon"><i className="icon-48"></i></div>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Message"
            required
          ></textarea>
        </div>
        <div className="form-group message-btn mt_20">
          <button type="submit" className="theme-btn btn-two" disabled={status === "loading"}>
            <span>{status === "loading" ? "Sending..." : "Send your message"}</span>
          </button>
        </div>
        {status === "success" && (
          <p className="mt-2 text-success">Message sent successfully! ✅</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-danger">Something went wrong. ❌</p>
        )}
      </form>
    </div>
  );
}
