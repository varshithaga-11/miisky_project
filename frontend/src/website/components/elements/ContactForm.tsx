import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { contactApi } from "../../utils/api";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: searchParams.get("subject") || "",
    message: "",
  });

  // Sync state if search params change
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      setFormData(prev => ({ ...prev, subject: subjectParam }));
    }
  }, [searchParams]);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await contactApi.send(formData);
      setStatus("success");
      toast.success("Message sent successfully ✅");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg + " ❌");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="default-form">
        <div className="row clearfix">
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                />
            </div>
            <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Type Comment Here..."
                />
            </div>
            <div className="col-lg-12 col-md-12 col-sm-12 form-group message-btn">
                <button
                type="submit"
                className="theme-btn btn-two"
                disabled={status === "loading"}
            >
                <span>{status === "loading" ? "Sending..." : "Send Message"}</span>
            </button>
            </div>
        </div>
    </form>
  );
}
