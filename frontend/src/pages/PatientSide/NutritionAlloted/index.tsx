import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyNutritionist, NutritionistWithProfile } from "./api";

const NutritionAllotedPage: React.FC = () => {
  const [data, setData] = useState<NutritionistWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyNutritionist();
        setData(res && res.nutritionist ? res : null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load nutritionist details");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const n = data?.nutritionist;
  const p = data?.profile;

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Nutritionist Allotted" description="Your allotted nutritionist" />
      <PageBreadcrumb pageTitle="Nutritionist Allotted" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : !n ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">No nutritionist allotted yet.</div>
      ) : (
        <div className="max-w-3xl p-6 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {n.first_name || n.last_name ? `${n.first_name || ""} ${n.last_name || ""}` : n.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.email}</p>
              {n.mobile && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile: {n.mobile}</p>
              )}
              {data?.assigned_on && (
                <p className="text-xs text-gray-400 mt-1">
                  Assigned on: {new Date(data.assigned_on).toLocaleString()}
                </p>
              )}
            </div>
            {p?.rating !== undefined && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                <p className="text-xl font-semibold text-yellow-500">
                  {p.rating?.toFixed(1)}{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({p.total_reviews ?? 0} reviews)
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
            {p?.qualification && (
              <div>
                <span className="font-semibold">Qualification: </span>
                {p.qualification}
              </div>
            )}
            {p?.years_of_experience && (
              <div>
                <span className="font-semibold">Experience: </span>
                {p.years_of_experience}
              </div>
            )}
            {p?.specializations && (
              <div className="md:col-span-2">
                <span className="font-semibold">Specializations: </span>
                {p.specializations}
              </div>
            )}
            {p?.languages && (
              <div className="md:col-span-2">
                <span className="font-semibold">Languages: </span>
                {p.languages}
              </div>
            )}
            {p?.available_modes && (
              <div className="md:col-span-2">
                <span className="font-semibold">Available modes: </span>
                {p.available_modes}
              </div>
            )}
            {p?.experience && (
              <div className="md:col-span-2">
                <span className="font-semibold">About: </span>
                {p.experience}
              </div>
            )}
            {p?.social_media_links_website_links && (
              <div className="md:col-span-2">
                <span className="font-semibold">Links: </span>
                {p.social_media_links_website_links}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NutritionAllotedPage;

