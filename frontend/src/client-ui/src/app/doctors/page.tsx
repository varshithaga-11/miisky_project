import Layout from "../../../components/layout/Layout";
import Image from "@/components/Image";
import { Link } from "react-router-dom";
import Cta from "../../../components/sections/home2/Cta";
export default function Doctors_Page() {

    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Our Doctors">
                <section className="team-page-section pt_120 pb_90 centred">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                                <div className="team-block-one wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <figure className="image-box"><Link to="/doctor-details"><Image src="/assets/images/team/team-1.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                        <div className="content-box">
                                            <h3><Link to="/doctor-details">Catherine Denuve</Link></h3>
                                            <span className="designation">Optegra eye</span>
                                            <ul className="social-links clearfix">
                                                <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-behance"></i></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                                <div className="team-block-one wow fadeInUp animated" data-wow-delay="300ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <figure className="image-box"><Link to="/doctor-details"><Image src="/assets/images/team/team-2.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                        <div className="content-box">
                                            <h3><Link to="/doctor-details">Jenny Wilson</Link></h3>
                                            <span className="designation">Lens replacement</span>
                                            <ul className="social-links clearfix">
                                                <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-behance"></i></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                                <div className="team-block-one wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <figure className="image-box"><Link to="/doctor-details"><Image src="/assets/images/team/team-3.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                        <div className="content-box">
                                            <h3><Link to="/doctor-details">Guy Hawkins</Link></h3>
                                            <span className="designation">Cataract surgery</span>
                                            <ul className="social-links clearfix">
                                                <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-behance"></i></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                                <div className="team-block-one wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <figure className="image-box"><Link to="/doctor-details"><Image src="/assets/images/team/team-4.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                        <div className="content-box">
                                            <h3><Link to="/doctor-details">Jane Cooper</Link></h3>
                                            <span className="designation">Clarivu eye</span>
                                            <ul className="social-links clearfix">
                                                <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-behance"></i></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                                <div className="team-block-one wow fadeInUp animated" data-wow-delay="300ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <figure className="image-box"><Link to="/doctor-details"><Image src="/assets/images/team/team-5.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                        <div className="content-box">
                                            <h3><Link to="/doctor-details">Wade Warren</Link></h3>
                                            <span className="designation">Glaucoma</span>
                                            <ul className="social-links clearfix">
                                                <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-behance"></i></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                                <div className="team-block-one wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms">
                                    <div className="inner-box">
                                        <figure className="image-box"><Link to="/doctor-details"><Image src="/assets/images/team/team-6.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                        <div className="content-box">
                                            <h3><Link to="/doctor-details">Esther Howard</Link></h3>
                                            <span className="designation">Laboratory</span>
                                            <ul className="social-links clearfix">
                                                <li><Link to="/"><i className="fab fa-facebook-f"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-twitter"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-dribbble"></i></Link></li>
                                                <li><Link to="/"><i className="fab fa-behance"></i></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Cta/>
            </Layout>
        </div>
    )
}
