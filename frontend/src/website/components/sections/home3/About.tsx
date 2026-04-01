import Image from "../../Image";
import { Link } from "react-router-dom";
export default function About() {
  return (
        <section className="about-style-four sec-pad">
            <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-13.png)" }}></div>
            <div className="auto-container">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                        <div className="content-block-one">
                            <div className="content-box">
                                <div className="sec-title mb_15">
                                    <span className="sub-title mb_5">About the company</span>
                                    <h2>Expertise and compassion saved my life</h2>
                                </div>
                                <div className="text-box mb_30">
                                    <p>The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life.</p>
                                </div>
                                <div className="inner-box mb_40">
                                    <div className="row clearfix">
                                        <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                            <div className="specialities-box">
                                                <h4>Our Specialities</h4>
                                                <ul className="list-style-one clearfix">
                                                    <li>Preventive care</li>
                                                    <li>Diagnostic testing</li>
                                                    <li>Mental health services</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                            <div className="specialities-box">
                                                <h4>Our Vision</h4>
                                                <ul className="list-style-one clearfix">
                                                    <li>To provide accessible and equitable</li>
                                                    <li>To use innovative technology</li>
                                                    <li>To empower patients</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-box">
                                    <Link to="/about" className="theme-btn btn-two"><span>Read More</span></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                        <div className="image_block_three">
                            <div className="image-box ml_3">
                                <div className="image-shape">
                                    <div className="shape-1" style={{ backgroundImage: "url(/website/assets/images/shape/shape-32.png)" }}></div>
                                    <div className="shape-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-33.png)" }}></div>
                                </div>
                                <div className="icon-box"><Image src="/website/assets/images/icons/icon-14.svg" alt="Icon" width={141} height={138} priority /></div>
                                <figure className="image"><Image src="/website/assets/images/resource/about-1.png" alt="Image" width={627} height={601} priority /></figure>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
}
