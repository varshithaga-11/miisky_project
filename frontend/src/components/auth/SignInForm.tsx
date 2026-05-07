import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { 
  EyeCloseIcon, 
  EyeIcon, 
  UserIcon,
} from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import loginUser, { getUserRolesByIdentifier } from "./signinApi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: "Admin",
  patient: "Patient",
  nutritionist: "Nutritionist",
  micro_kitchen: "Micro Kitchen",
  supply_chain: "Supply Chain",
  non_patient: "Non-Patient",
  doctor: "Doctor",
  master: "Master",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  patient: (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 14C20.6569 14 22 12.6569 22 11C22 9.34315 20.6569 8 19 8C17.3431 8 16 9.34315 16 11C16 12.6569 17.3431 14 19 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 8H3V11C3 12.1046 3.89543 13 5 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 13V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 13V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  nutritionist: (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  micro_kitchen: (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  supply_chain: (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 10L12 3L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 14L12 21L19 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  doctor: (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  master: (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.4 15C19.7866 14.3333 20 13.6667 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 13.6667 4.2134 14.3333 4.6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Identifier/Password, 2: Role Selection
  const [availableRoles, setAvailableRoles] = useState<{ value: string; label: string }[]>([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleFetchRoles = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast.error("Please enter your email/username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await getUserRolesByIdentifier(identifier);

      if (result.success && result.roles && result.roles.length > 0) {
        const rolesOptions = result.roles.map((r) => ({
          value: r,
          label: ROLE_DISPLAY_NAMES[r] || r,
        }));
        setAvailableRoles(rolesOptions);
        setUsername(result.username || "");
        
        if (rolesOptions.length === 1) {
          // If only one role, automatically select it and proceed to login
          const autoRole = rolesOptions[0].value;
          setRole(autoRole);
          handleLogin(autoRole, result.username || "");
        } else {
          setStep(2);
        }
      } else {
        toast.error(result.error || "No account found with this identifier.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Fetch roles error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (selectedRole: string, finalUsername: string) => {
    setIsLoading(true);

    try {
      const result = await loginUser({
        username: finalUsername || username,
        password: password,
        role: selectedRole,
      });

      if (result.success) {
        toast.success('Login successful! Redirecting...');
        const userRole = result.userRole;
        let targetPath = "/admin/dashboard";

        if (userRole === 'master') {
          targetPath = "/master/master-dashboard";
        } else if (userRole === 'patient') {
          targetPath = "/patient/workflow";
        } else if (userRole === 'nutritionist') {
          targetPath = "/nutrition/workflow";
        } else if (userRole === 'micro_kitchen') {
          targetPath = "/microkitchen/workflow";
        } else if (userRole === 'non_patient') {
          targetPath = "/non-patient/dashboard";
        } else if (userRole === 'doctor') {
          targetPath = "/doctor/all-patients";
        } else if (userRole === 'supply_chain') {
          targetPath = "/supplychain/workflow";
        }

        setTimeout(() => {
          navigate(targetPath);
        }, 1000);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (step === 1) {
      handleFetchRoles(e);
    } else {
      e.preventDefault();
      if (!role) {
        toast.error("Please select a role.");
        return;
      }
      handleLogin(role, username);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className={step === 2 ? "max-w-xl mx-auto w-full" : ""}>
          <div className="mb-5 sm:mb-8">
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-brand-500 hover:text-brand-600 mb-3"
            >
              ← Go to Website
            </a>
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
              {step === 1 ? "Sign In" : "Select Role"}
            </h1>
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              className="z-[99999]"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {step === 1 
                ? "Enter your email or username and password to sign in!" 
                : "Your account is associated with multiple roles. Please select which one you want to use."}
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {step === 1 ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label>
                          Email or Username <span className="text-error-500">*</span>{" "}
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter your email or username"
                          value={identifier}
                          onChange={e => setIdentifier(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>
                          Password <span className="text-error-500">*</span>{" "}
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                          />
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                          >
                            {showPassword ? (
                              <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                            ) : (
                              <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link
                        to="/resetpassword"
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                      {availableRoles.map((roleOption) => (
                        <div
                          key={roleOption.value}
                          onClick={() => {
                            setRole(roleOption.value);
                            handleLogin(roleOption.value, username);
                          }}
                          className={`cursor-pointer group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                            role === roleOption.value
                              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                              : "border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className={`p-3 rounded-xl mb-3 transition-colors ${
                            role === roleOption.value
                              ? "bg-brand-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:text-brand-500"
                          }`}>
                            {ROLE_ICONS[roleOption.value] || <UserIcon className="size-6" />}
                          </div>
                          <span className={`text-sm font-semibold transition-colors ${
                            role === roleOption.value
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {roleOption.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 flex justify-center">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors flex items-center gap-2"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Back to sign in
                      </button>
                    </div>
                  </div>
                )}
                
                {step === 1 && (
                  <div>
                    <Button
                      className="w-full"
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Fetching roles...' : 'Continue'}
                    </Button>
                  </div>
                )}
              </div>
            </form>

            {step === 1 && (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
                  Don&apos;t have an account? {""}
                  <Link
                    to="/signup"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
