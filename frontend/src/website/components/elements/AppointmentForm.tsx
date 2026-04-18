import { useState } from "react";
import { toast } from "react-toastify";
import { contactApi } from '@website/utils/api';
import Image from '@website/components/Image';

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

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await contactApi.send({
        ...formData,
        inquiry_type: "appointment",
        subject: `Appointment Inquiry: ${departmentName || "General"}`
      });
      toast.success("Appointment request sent successfully! ✅");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again! ❌");
    } finally {
      setSubmitting(false);
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
            placeholder="Email (Optional)"
          />
        </div>
        <div className="form-group">
          <div className="icon">
            <Image src="/website/assets/images/icons/icon-15.svg" alt="Phone" width={15} height={15} />
          </div>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
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
          <button type="submit" className="theme-btn btn-two" disabled={submitting}>
            <span>{submitting ? "Sending..." : "Send Appointment"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
