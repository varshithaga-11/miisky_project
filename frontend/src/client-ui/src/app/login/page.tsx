import { useState, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "../../utils/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const loginResult = await authApi.login({ username: formData.username, password: formData.password });
      console.log("Login successful, tokens received:", loginResult);

      // Give browser time to set the cookie before navigating
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to the requested page or home
      const nextUrl = searchParams.get("next") || "/";
      console.log("Redirecting to:", nextUrl);
      navigate(nextUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid username or password. Please try again.";
      console.error("Login error:", message);
      setErrorMessage(message);
      setStatus("error");
    }
  };

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
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "44px 40px",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                }}
              >
                {/* Header */}
                <div className="sec-title centred mb_30">
                  <span className="sub-title mb_5">Welcome Back</span>
                  <h2 style={{ fontSize: "26px" }}>Sign in to Miisky</h2>
                  <p style={{ marginBottom: 0 }}>
                    Access your appointments, health records and more.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Username */}
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="login-username"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
                    >
                      Username
                    </label>
                    <input
                      id="login-username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Your username"
                      required
                      autoComplete="username"
                      style={{ width: "100%", height: "48px", padding: "0 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px" }}
                    />
                  </div>

                  {/* Password */}
                  <div className="form-group" style={{ marginBottom: "8px", position: "relative" }}>
                    <label
                      htmlFor="login-password"
                      style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
                    >
                      Password
                    </label>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Your password"
                      required
                      autoComplete="current-password"
                      style={{
                        width: "100%", height: "48px", padding: "0 50px 0 16px",
                        borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute", right: "14px", top: "38px",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#888", fontSize: "13px", fontWeight: 500,
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Forgot password */}
                  <div style={{ textAlign: "right", marginBottom: "22px" }}>
                    <Link to="/forgot-password" style={{ fontSize: "13px", color: "#f5821f" }}>
                      Forgot password?
                    </Link>
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <p
                      style={{
                        background: "#fff0f0", border: "1px solid #ffcccc",
                        borderRadius: "8px", padding: "10px 14px",
                        color: "#cc0000", fontSize: "14px", marginBottom: "16px",
                      }}
                    >
                      {errorMessage}
                    </p>
                  )}

                  {/* Submit */}
                  <div className="message-btn" style={{ marginBottom: "20px" }}>
                    <button
                      type="submit"
                      id="login-submit-btn"
                      className="theme-btn btn-two"
                      disabled={status === "loading"}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <span>
                        {status === "loading" ? "Signing in…" : "Sign In"}
                      </span>
                    </button>
                  </div>

                  {/* Register link */}
                  <p style={{ textAlign: "center", fontSize: "14px", margin: 0 }}>
                    Don&apos;t have an account?{" "}
                    <Link to="/register" style={{ color: "#f5821f", fontWeight: 600 }}>
                      Create one
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
