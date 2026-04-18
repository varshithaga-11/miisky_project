import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi, type RegisterPayload } from '@website/utils/api';

// Exact ROLE_CHOICES from backend model (key → display label)
const ROLES: { value: string; label: string }[] = [
  { value: "patient",       label: "Patient" },
  { value: "non_patient",   label: "Non Patient" },
  { value: "nutritionist",  label: "Nutritionist / Dietician" },
  { value: "micro_kitchen", label: "Micro Kitchen" },
  { value: "supply_chain",  label: "Supply Chain" },
  { value: "food_buyer",    label: "Food Buyer" },
];

const INITIAL_FORM: RegisterPayload & { password_confirm: string } = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  password_confirm: "",
  role: "patient",
};

export default function RegisterPage() {

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors]     = useState<Partial<Record<keyof typeof INITIAL_FORM | "general", string>>>({});
  const [showPwd, setShowPwd]   = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  // ── Client-side validation ────────────────────────────────────────────────

  function validate(): boolean {
    const errs: typeof errors = {};

    if (!formData.username.trim())   errs.username  = "Username is required.";
    if (formData.username.length < 3) errs.username = "Username must be at least 3 characters.";
    if (!formData.email.trim())       errs.email     = "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Enter a valid email address.";
    if (!formData.first_name.trim())  errs.first_name = "First name is required.";
    if (!formData.last_name.trim())   errs.last_name  = "Last name is required.";
    if (formData.password.length < 8) errs.password   = "Password must be at least 8 characters.";
    if (formData.password !== formData.password_confirm)
      errs.password_confirm = "Passwords do not match.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Field change handler ──────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the field-level error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrors({});

    try {
      await authApi.register(formData);
      setStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setErrors({ general: message });
      setStatus("error");
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <div className="boxed_wrapper">
        <section
          className="sec-pad"
          style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
        >
          <div className="auto-container" style={{ width: "100%" }}>
            <div className="row clearfix justify-content-center">
              <div className="col-lg-5 col-md-8 col-sm-12">
                <div
                  style={{
                    background: "#fff", borderRadius: "12px",
                    padding: "44px 40px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                  <h3 style={{ marginBottom: "12px" }}>Account Created!</h3>
                  <p style={{ marginBottom: "28px", color: "#666" }}>
                    Your Miisky account has been successfully created. You can now sign in.
                  </p>
                  <div className="message-btn">
                    <Link to="/login" className="theme-btn btn-two">
                      <span>Sign In Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Form field helper ─────────────────────────────────────────────────────

  const field = (
    id: string,
    label: string,
    name: keyof typeof INITIAL_FORM,
    type = "text",
    placeholder = "",
    autoComplete?: string
  ) => (
    <div className="form-group" style={{ marginBottom: "16px" }}>
      <label
        htmlFor={id}
        style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
      >
        {label}
        <span style={{ color: "red" }}> *</span>
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={formData[name] as string}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        style={{
          width: "100%", height: "48px", padding: "0 16px",
          borderRadius: "8px", fontSize: "15px",
          border: errors[name] ? "1px solid #cc0000" : "1px solid #ddd",
        }}
      />
      {errors[name] && (
        <p style={{ color: "#cc0000", fontSize: "12px", marginTop: "4px" }}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="boxed_wrapper">
      <section
        className="sec-pad"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "60px 0" }}
      >
        <div className="auto-container" style={{ width: "100%" }}>
          <div className="row clearfix justify-content-center">
            <div className="col-lg-6 col-md-9 col-sm-12">
              <div
                style={{
                  background: "#fff", borderRadius: "12px",
                  padding: "44px 40px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                }}
              >
                {/* Header */}
                <div className="sec-title centred mb_30">
                  <span className="sub-title mb_5">Join Miisky</span>
                  <h2 style={{ fontSize: "26px" }}>Create Your Account</h2>
                  <p style={{ marginBottom: 0 }}>
                    Fill in the details below to get started with Miisky.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Name row */}
                  <div className="row">
                    <div className="col-md-6">
                      {field("reg-first-name", "First Name", "first_name", "text", "Jane", "given-name")}
                    </div>
                    <div className="col-md-6">
                      {field("reg-last-name", "Last Name", "last_name", "text", "Doe", "family-name")}
                    </div>
                  </div>

                  {/* Username */}
                  {field("reg-username", "Username", "username", "text", "janedoe123", "username")}

                  {/* Email */}
                  {field("reg-email", "Email Address", "email", "email", "jane@example.com", "email")}

                  {/* Role */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="reg-role"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
                    >
                      Role
                    </label>
                    <div className="select-box">
                      <select
                        id="reg-role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={{
                          width: "100%", height: "48px", padding: "0 16px",
                          borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px",
                          background: "#fff", appearance: "auto",
                        }}
                      >
                        {ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-group" style={{ marginBottom: "16px", position: "relative" }}>
                    <label
                      htmlFor="reg-password"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
                    >
                      Password <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="reg-password"
                      type={showPwd ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                      style={{
                        width: "100%", height: "48px", padding: "0 50px 0 16px",
                        borderRadius: "8px", fontSize: "15px",
                        border: errors.password ? "1px solid #cc0000" : "1px solid #ddd",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      aria-label={showPwd ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: "14px", top: "38px", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", fontWeight: 500 }}
                    >
                      {showPwd ? "Hide" : "Show"}
                    </button>
                    {errors.password && (
                      <p style={{ color: "#cc0000", fontSize: "12px", marginTop: "4px" }}>{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group" style={{ marginBottom: "24px", position: "relative" }}>
                    <label
                      htmlFor="reg-password-confirm"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
                    >
                      Confirm Password <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="reg-password-confirm"
                      type={showPwd2 ? "text" : "password"}
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      required
                      style={{
                        width: "100%", height: "48px", padding: "0 50px 0 16px",
                        borderRadius: "8px", fontSize: "15px",
                        border: errors.password_confirm ? "1px solid #cc0000" : "1px solid #ddd",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd2(!showPwd2)}
                      aria-label={showPwd2 ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: "14px", top: "38px", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", fontWeight: 500 }}
                    >
                      {showPwd2 ? "Hide" : "Show"}
                    </button>
                    {errors.password_confirm && (
                      <p style={{ color: "#cc0000", fontSize: "12px", marginTop: "4px" }}>{errors.password_confirm}</p>
                    )}
                  </div>

                  {/* General error */}
                  {errors.general && (
                    <div
                      style={{
                        background: "#fff0f0", border: "1px solid #ffcccc",
                        borderRadius: "8px", padding: "12px 16px",
                        color: "#cc0000", fontSize: "14px", marginBottom: "20px",
                      }}
                    >
                      {errors.general}
                    </div>
                  )}

                  {/* Submit */}
                  <div className="message-btn" style={{ marginBottom: "20px" }}>
                    <button
                      type="submit"
                      id="register-submit-btn"
                      className="theme-btn btn-two"
                      disabled={status === "loading"}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <span>
                        {status === "loading" ? "Creating account…" : "Create Account"}
                      </span>
                    </button>
                  </div>

                  {/* Login link */}
                  <p style={{ textAlign: "center", fontSize: "14px", margin: 0 }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#f5821f", fontWeight: 600 }}>
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
