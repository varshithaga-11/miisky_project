import Image from "@/components/Image";
export default function Chooseus() {
  return (
        <section className="chooseus-style-two p_relative pt_100 pb_110">
            <figure className="image-layer"><Image src="/assets/images/resource/chooseus-1.jpg" alt="Image" width={642} height={407} priority /></figure>
            <div className="pattern-layer">
                <div className="pattern-1" style={{ backgroundImage: "url(assets/images/shape/shape-28.png)" }}></div>
                <div className="pattern-2" style={{ backgroundImage: "url(assets/images/shape/shape-29.png)" }}></div>
            </div>
            <div className="auto-container">
                <div className="row clearfix">
                    <div className="col-lg-4 col-md-12 col-sm-12 title-column">
                        <div className="sec-title mt_190">
                            <span className="sub-title mb_5">Why Choose Us</span>
                            <h2>What&apos;s Our Speciality</h2>
                            <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various illnesses, injuries, and diseases. It</p>
                        </div>
                    </div>
                    <div className="col-lg-8 col-md-12 col-sm-12 content-column">
                        <div className="row clearfix">
                            <div className="col-lg-6 col-md-6 col-sm-12 chooseus-block">
                                <div className="chooseus-block-one">
                                    <div className="inner-box">
                                        <div className="icon-box">
                                            <div className="icon"><i className="icon-28"></i></div>
                                            <span className="count-text">01</span>
                                        </div>
                                        <h3>Modern Technology</h3>
                                        <p>The phrase emphasizes the importance of healthcare providers, researchers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12 chooseus-block">
                                <div className="chooseus-block-one">
                                    <div className="inner-box">
                                        <div className="icon-box">
                                            <div className="icon"><i className="icon-29"></i></div>
                                            <span className="count-text">02</span>
                                        </div>
                                        <h3>Success of Treatments</h3>
                                        <p>The phrase emphasizes the importance of healthcare providers, researchers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12 chooseus-block">
                                <div className="chooseus-block-one">
                                    <div className="inner-box">
                                        <div className="icon-box">
                                            <div className="icon"><i className="icon-15"></i></div>
                                            <span className="count-text">03</span>
                                        </div>
                                        <h3>Certified Doctors</h3>
                                        <p>The phrase emphasizes the importance of healthcare providers, researchers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12 chooseus-block">
                                <div className="chooseus-block-one">
                                    <div className="inner-box">
                                        <div className="icon-box">
                                            <div className="icon"><i className="icon-30"></i></div>
                                            <span className="count-text">04</span>
                                        </div>
                                        <h3>World Class Doctor</h3>
                                        <p>The phrase emphasizes the importance of healthcare providers, researchers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
}
