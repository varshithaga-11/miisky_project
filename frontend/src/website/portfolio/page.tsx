import Layout from "../components/layout/Layout";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import Cta from "../components/sections/home2/Cta";

export default function Portfolio_Page() {
  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Portfolio One">
        <section className="portfolio-page-section pt_120 pb_90">
            <div className="auto-container">
                <div className="row clearfix">
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-1.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-1.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/website">Regular Dental Cleaning</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-2.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-2.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/website">Prepare to Speak</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-7.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-7.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/website">From Diagnosis to Cure</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-8.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-8.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/website">Empowering Patients</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-5.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-5.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/website">From Healthcare Provider</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-6.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-6.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/website">Transforming Health</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <Cta />
      </Layout>
    </div>
  );
}
