import React from 'react'
import Layout from "../components/layout/Layout";
import PortfolioFilter1 from "../components/elements/PortfolioFilter1";
import Cta from "../components/sections/home2/Cta";

export default function Portfolio_Page_Two() {
  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Portfolio Two">
        <section className="portfolio-page-section pt_120 pb_120">
            <PortfolioFilter1/>
        </section>

        <Cta />
      </Layout>
    </div>
  );
}
