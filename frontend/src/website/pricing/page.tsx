import { useEffect, useState } from "react";
import { useLayout } from "../context/LayoutContext";
import { Link } from "react-router-dom";
import Cta from "../components/sections/home2/Cta";
import { getDietPlans } from "@/utils/api";
import { FiCheck } from "react-icons/fi";

const MOCK_PLANS = [
    {
        id: 1,
        name: "Basic Plan",
        price: "25.00",
        period: "monthly",
        savings_text: "Save 25%",
        features: ["COVID-19", "Eye Infections", "Senior Care", "Cardiology", "Family"],
        icon_class: "icon-20",
        is_popular: false
    }
];

export default function Pricing_Page() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 8;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Plans");

        const fetchData = async () => {
            try {
                setLoading(true);
                const planRes = await getDietPlans({ limit: 100, is_active: true });
                const planData = Array.isArray(planRes.data) ? planRes.data : (planRes.data.results || []);

                if (planData.length > 0) {
                    const mappedPlans = planData.map((p: any) => {
                        const amount = parseFloat(p.amount) || 0;
                        const discount = parseFloat(p.discount_amount) || 0;
                        const savingsPercent = amount > 0 ? Math.round((discount / amount) * 100) : 0;

                        return {
                            id: p.id,
                            name: p.title,
                            price: p.final_amount,
                            period: `${p.no_of_days} Days`,
                            savings_text: savingsPercent > 0 ? `Save ${savingsPercent}%` : "Best Value",
                            features: p.features?.map((f: any) => f.feature) || [],
                            icon_class: "icon-20", // Default icon
                            is_popular: p.is_popular || false
                        };
                    });
                    // Sort plans alphabetically and numerically by name
                    const sortedPlans = mappedPlans.sort((a: any, b: any) => 
                        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                    );
                    setPlans(sortedPlans);
                    setTotalPages(Math.ceil(sortedPlans.length / PAGE_SIZE) || 1);
                } else {
                    setPlans(MOCK_PLANS);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Failed to fetch pricing:", error);
                setPlans(MOCK_PLANS);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setHeaderStyle, setBreadcrumbTitle]);

    const displayedPlans = plans.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    if (loading) {
        return (
            <div className="boxed_wrapper">
                <section className="pricing-section pt_120 pb_120 text-center">
                    <div className="auto-container">
                        <div className="title-text">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Discover Our Plans</h2>
                        </div>
                        <div className="mt-16 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="boxed_wrapper">
            <section className="pricing-section pt_120 pb_120 centred">
                <div className="auto-container">
                    <div className="title-text text-center mb-24">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Professional Diet Plans</h2>
                        <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div className="row flex flex-wrap justify-start -mx-4">
                        {displayedPlans.map((plan, index) => (
                            <div key={plan.id || index} className="col-lg-3 col-md-6 col-sm-12 info-block px-4 mb-12">
                                <div className="info-block-two wow fadeInUp animated h-full" data-wow-delay={`${index * 200}ms`} data-wow-duration="1500ms">
                                    <div className="inner-box shadow-xl hover:shadow-2xl transition-all duration-400 rounded-[28px] bg-white dark:bg-gray-800/80 backdrop-blur-sm group border border-gray-100 dark:border-white/5 hover:-translate-y-2.5"
                                        style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', padding: '40px 25px 35px 25px', position: 'relative', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>

                                        {plan.is_popular && (
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-md">
                                                    Best
                                                </span>
                                            </div>
                                        )}

                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                                                {plan.name}
                                            </h3>
                                            <div className="inline-block bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
                                                    {plan.savings_text}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-center mb-8 pb-6 border-b border-gray-50 dark:border-white/5">
                                            <div className="flex items-center justify-center text-gray-900 dark:text-white leading-none">
                                                <span className="text-xl font-bold mr-0.5 mt-1 opacity-50">₹</span>
                                                <span className="text-4xl font-black">{plan.price}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-2 font-black uppercase tracking-[0.2em]">{plan.period}</p>
                                        </div>

                                        <div className="flex-grow mb-10 text-left overflow-y-auto custom-scrollbar pr-1">
                                            <ul className="space-y-4">
                                                {(plan.features || []).map((feature: string, fIdx: number) => (
                                                    <li key={fIdx} className="flex items-start gap-3">
                                                        <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <FiCheck size={12} className="text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="text-[13px] text-gray-600 dark:text-gray-400 font-medium leading-tight">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-auto pt-2">
                                            <Link
                                                to="/plans"
                                                className="block w-full py-4 rounded-[18px] bg-[#0646ac] hover:bg-blue-700 text-white font-bold text-center transition-all shadow-lg hover:shadow-blue-500/40 text-[11px] uppercase tracking-[0.2em]"
                                            >
                                                Get Started
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-wrapper centred mt-12">
                            <ul className="pagination clearfix">
                                <li>
                                    <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
                                        <i className="icon-21"></i>
                                    </Link>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i+1}>
                                        <Link to="#" className={currentPage === i + 1 ? "current" : ""} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                                            {(i + 1).toString().padStart(2, '0')}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
                                        <i className="icon-22"></i>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </section>
            <Cta />
        </div>
    );
}
