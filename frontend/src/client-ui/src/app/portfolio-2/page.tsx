import React from 'react'
import Layout from "../../../components/layout/Layout";
import dynamic from 'next/dynamic'
const PortfolioFilter1 = dynamic(() => import('../../../components/elements/PortfolioFilter1'), { ssr: false,})
import Cta from "../../../components/sections/home2/Cta";

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
