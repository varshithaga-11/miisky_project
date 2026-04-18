import { useEffect } from "react";
import { useLayout } from '@website/context/LayoutContext';
import PortfolioFilter1 from "../components/elements/PortfolioFilter1";
import Cta from '@website/components/sections/home2/Cta';

export default function Portfolio_Page_Two() {
  const { setHeaderStyle, setBreadcrumbTitle } = useLayout();

  useEffect(() => {
    setHeaderStyle(1);
    setBreadcrumbTitle("Portfolio Two");
  }, [setHeaderStyle, setBreadcrumbTitle]);

  return (
    <div className="boxed_wrapper">
        <section className="portfolio-page-section pt_120 pb_120">
            <PortfolioFilter1/>
        </section>

      <Cta />
    </div>
  );
}
