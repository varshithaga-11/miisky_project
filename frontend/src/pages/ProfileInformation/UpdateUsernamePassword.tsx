import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Form from "../../components/form/Form";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import { createApiUrl, getAuthHeaders } from "../../access/access";

type UpdateType = "password" | "username" | "both";

const UpdateUsernamePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [updateType, setUpdateType] = useState<UpdateType>("password");
  const [form, setForm] = useState({
    username: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const url = createApiUrl("api/current-user/");
        const res = await axios.get(url, { headers: await getAuthHeaders() });
        setForm((prev) => ({ ...prev, username: res.data?.username || "" }));
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setSuccess("");
  };

  const handleUpdateTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextType = e.target.value as UpdateType;
    setUpdateType(nextType);
    setErrors({});
    setSuccess("");

    if (nextType === "username") {
      setForm((prev) => ({ ...prev, new_password: "", confirm_password: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    const payload: Record<string, string> = {};
    if (updateType === "username" || updateType === "both") {
      payload.username = form.username;
    }
    if (updateType === "password" || updateType === "both") {
      payload.new_password = form.new_password;
      payload.confirm_password = form.confirm_password;
    }
    payload.old_password = form.old_password;

    try {
      const url = createApiUrl("api/updateusernamepassword/");
      const res = await axios.patch(url, payload, { headers: await getAuthHeaders() });
      setSuccess(res.data?.detail || "Profile updated successfully.");
      setForm((prev) => ({
        ...prev,
        old_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const nextErrors: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => {
          if (Array.isArray(v)) nextErrors[k] = String(v[0]);
          else nextErrors[k] = String(v);
        });
        setErrors(nextErrors);
      } else {
        setErrors({ non_field_errors: "Something went wrong." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Update login details" description="Change username and password" />
      <PageBreadCrumb pageTitle="Update Login Details" />
      <div className="container mx-auto px-2 py-8 flex justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Update Profile Login
          </h2>

          <div className="mb-4 flex justify-between gap-2 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="password"
                checked={updateType === "password"}
                onChange={handleUpdateTypeChange}
              />
              Change Password
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="username"
                checked={updateType === "username"}
                onChange={handleUpdateTypeChange}
              />
              Change Username
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="both"
                checked={updateType === "both"}
                onChange={handleUpdateTypeChange}
              />
              Both
            </label>
          </div>

          <Form onSubmit={handleSubmit} className="space-y-5">
            {(updateType === "username" || updateType === "both") && (
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="username">
                  Username
                </label>
                <InputField
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  hint={errors.username}
                  placeholder="Enter new username"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="old_password">
                Old Password<span className="text-red-500">*</span>
              </label>
              <InputField
                id="old_password"
                name="old_password"
                type="password"
                value={form.old_password}
                onChange={handleChange}
                error={!!errors.old_password}
                hint={errors.old_password}
                required
                placeholder="Enter old password"
              />
            </div>

            {(updateType === "password" || updateType === "both") && (
              <>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="new_password">
                    New Password
                  </label>
                  <InputField
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={form.new_password}
                    onChange={handleChange}
                    error={!!errors.new_password}
                    hint={errors.new_password}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label
                    className="block font-semibold mb-1 text-gray-700 dark:text-gray-200"
                    htmlFor="confirm_password"
                  >
                    Confirm Password
                  </label>
                  <InputField
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    error={!!errors.confirm_password}
                    hint={errors.confirm_password}
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 mt-2 justify-end">
              <Button type="submit" size="md" variant="primary" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update"}
              </Button>
              <Button type="button" size="md" variant="outline" onClick={() => navigate(-1)} className="w-full">
                Cancel
              </Button>
            </div>

            {errors.non_field_errors && (
              <div className="text-red-500 font-medium mt-2 text-center">{errors.non_field_errors}</div>
            )}
            {success && <div className="text-green-600 font-medium mt-2 text-center">{success}</div>}
          </Form>
        </div>
      </div>
    </>
  );
};

export default UpdateUsernamePasswordPage;
