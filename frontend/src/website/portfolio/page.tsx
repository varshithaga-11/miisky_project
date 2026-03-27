import { useState, useEffect } from "react";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Cta from "../components/sections/home2/Cta";
import { getGalleryItems } from "../../utils/api";
import { MOCK_PORTFOLIO } from "../utils/mockData";

export default function Portfolio_Page() {
  const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
  const [portfolioItems, setPortfolioItems] = useState(MOCK_PORTFOLIO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHeaderStyle(3);
    setBreadcrumbTitle("Portfolio One");
  }, [setHeaderStyle, setBreadcrumbTitle]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await getGalleryItems();
        const items = Array.isArray(response.data) ? response.data : response.data.results || [];
        setPortfolioItems(items.length > 0 ? items : MOCK_PORTFOLIO);
      } catch (err) {
        console.warn('Failed to fetch portfolio items:', err);
        setPortfolioItems(MOCK_PORTFOLIO);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

  return (
    <div className="boxed_wrapper">
        <section className="portfolio-page-section pt_120 pb_90">
            <div className="auto-container">
                <div className="row clearfix">
                    {portfolioItems.map((item: any) => (
                        <div key={item.id} className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                            <div className="portfolio-block-one">
                                <div className="inner-box">
                                    <figure className="image-box"><Image src={item.image_url || item.image || "/website/assets/images/gallery/portfolio-1.jpg"} alt={item.title || item.name} width={480} height={600} priority /></figure>
                                    <div className="view-btn"><Link to={item.image_url || item.image || "/website/assets/images/gallery/portfolio-1.jpg"} className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                    <div className="text-box">
                                        <h3><Link to="/website">{item.title || item.name}</Link></h3>
                                        <span>{item.category || "Medical"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <Cta />
    </div>
  );
}
