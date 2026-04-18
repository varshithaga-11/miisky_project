import Image from '@website/components/Image';
import { Link } from "react-router-dom";
export default function Portfolio() {
  return (
        <section className="portfolio-style-two p_relative">
            <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-28.png)" }}></div>
            <div className="auto-container">
                <div className="sec-title centred mb_60">
                    <span className="sub-title mb_5">How It Works</span>
                    <h2>How it helps you to keep <br />healthy</h2>
                    <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />illnesses, injuries, and diseases. It</p>
                </div>
                <div className="row clearfix">
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-1.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-1.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/">Regular Dental Cleaning</Link></h3>
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
                                    <h3><Link to="/">Prepare to Speak</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-3.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-3.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/">From Diagnosis to Cure</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 portfolio-block">
                        <div className="portfolio-block-one">
                            <div className="inner-box">
                                <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-4.jpg" alt="Image" width={480} height={600} priority /></figure>
                                <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-4.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                                <div className="text-box">
                                    <h3><Link to="/">Empowering Patients</Link></h3>
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
                                    <h3><Link to="/">From Healthcare Provider</Link></h3>
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
                                    <h3><Link to="/">Transforming Health</Link></h3>
                                    <span>Residential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
}
