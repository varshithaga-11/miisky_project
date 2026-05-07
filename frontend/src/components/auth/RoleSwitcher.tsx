import React, { useState, useEffect } from "react";
import { ChevronDown, RefreshCw, UserCheck } from "lucide-react";
import { getAvailableRoles, switchRole } from "./signupApi";
import { getUserRoleFromToken, getDashboardPath } from "../../utils/auth";
import { toast } from "react-toastify";

const RoleSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentRole = getUserRoleFromToken();

  useEffect(() => {
    const fetchRoles = async () => {
      const result = await getAvailableRoles();
      if (result.success && result.roles) {
        setRoles(result.roles);
      }
    };

    fetchRoles();
  }, []);

  const handleRoleSwitch = async (role: string) => {
    if (role === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await switchRole(role);
      if (result.success && result.tokens) {
        localStorage.setItem("access", result.tokens.access);
        localStorage.setItem("refresh", result.tokens.refresh);
        toast.success(`Switched to ${role} dashboard`);
        
        // Redirect to the new dashboard
        const nextPath = getDashboardPath(role as any);
        window.location.href = nextPath;
      } else {
        toast.error(result.error || "Failed to switch role");
      }
    } catch (err) {
      toast.error("An error occurred while switching roles");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  if (roles.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 transition-colors shadow-sm"
      >
        <UserCheck className="w-4 h-4 text-brand-500" />
        <span className="capitalize">{currentRole?.replace("_", " ")}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3">
              Switch Dashboard
            </span>
          </div>
          <div className="py-1">
            {roles.map((role) => (
              <button
                key={role}
                disabled={isLoading}
                onClick={() => handleRoleSwitch(role)}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors
                  ${role === currentRole 
                    ? "text-brand-600 bg-brand-50/50 dark:bg-brand-500/10 font-semibold" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="capitalize">{role.replace("_", " ")}</span>
                {role === currentRole ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : "opacity-0"}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
