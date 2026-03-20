import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyNutritionist, NutritionistWithProfile, submitRating, getMyRatings, NutritionistRating } from "./api";
import { FiStar } from "react-icons/fi";

const NutritionAllotedPage: React.FC = () => {
  const [data, setData] = useState<NutritionistWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myExistingRating, setMyExistingRating] = useState<NutritionistRating | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [res, ratings] = await Promise.all([getMyNutritionist(), getMyRatings()]);
      setData(res && res.nutritionist ? res : null);
      
      if (res?.nutritionist) {
        const existing = ratings.find(r => r.nutritionist === res.nutritionist?.id);
        if (existing) {
          setMyExistingRating(existing);
          setRating(existing.rating);
          setReview(existing.review || "");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleSubmitRating = async () => {
    if (!data?.nutritionist?.id) return;
    if (rating === 0) {
      toast.warning("Please select a rating star");
      return;
    }

    setSubmitting(true);
    try {
      await submitRating({
        nutritionist: data.nutritionist.id,
        rating,
        review
      });
      toast.success("Thank you for your feedback!");
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

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

          {/* Rating Section */}
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-white shadow-lg shadow-yellow-400/20">
                        <FiStar size={16} fill="white" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                        {myExistingRating ? "Update Your Feedback" : "Rate Your Nutritionist"}
                    </h3>
                </div>

                <div className="space-y-6 bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`transition-all hover:scale-125 focus:outline-none ${
                                        (hoverRating || rating) >= star 
                                            ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" 
                                            : "text-gray-300 dark:text-gray-700"
                                    }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <FiStar 
                                        size={36} 
                                        fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                                        strokeWidth={2.5}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                            {rating > 0 ? `YOU'RE GIVING ${rating} STAR${rating > 1 ? 'S' : ''}` : "Select stars to rate"}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-2">Your Review (Optional)</label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience with the nutrition planning, response time, and expert guidance..."
                            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl p-6 text-sm text-gray-700 dark:text-gray-300 placeholder:italic placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400/50 transition-all resize-none h-32"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitRating}
                            disabled={submitting || rating === 0}
                            className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {submitting ? "SUBMITTING..." : (myExistingRating ? "UPDATE FEEDBACK" : "SUBMIT RATING")}
                        </button>
                    </div>
                </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NutritionAllotedPage;

