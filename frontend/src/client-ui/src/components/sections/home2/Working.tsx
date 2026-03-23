import Image from "@/components/Image";
export default function Working() {
  return (
        <section className="working-section sec-pad centred">
            <div className="auto-container">
                <div className="sec-title mb_60">
                    <span className="sub-title mb_5">How It Works</span>
                    <h2>How it helps you to keep <br />healthy</h2>
                    <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />illnesses, injuries, and diseases. It</p>
                </div>
                <div className="inner-container p_relative">
                    <div className="arrow-shape" style={{ backgroundImage: "url(assets/images/shape/shape-18.png)" }}></div>
                    <div className="row clearfix">
                        <div className="col-lg-4 col-md-6 col-sm-12 working-block">
                            <div className="working-block-one">
                                <div className="inner-box">
                                    <div className="image-box">
                                        <figure className="image"><Image src="/assets/images/resource/working-1.jpg" alt="Image" width={250} height={250} priority /></figure>
                                        <span className="count-text">01</span>
                                    </div>
                                    <div className="lower-content">
                                        <h3>Get Appointment</h3>
                                        <p>On the other hand, we denounce with righteous indignation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 working-block">
                            <div className="working-block-one">
                                <div className="inner-box">
                                    <div className="image-box">
                                        <figure className="image"><Image src="/assets/images/resource/working-2.jpg" alt="Image" width={250} height={250} priority /></figure>
                                        <span className="count-text">02</span>
                                    </div>
                                    <div className="lower-content">
                                        <h3>Start Check-Up</h3>
                                        <p>On the other hand, we denounce with righteous indignation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 working-block">
                            <div className="working-block-one">
                                <div className="inner-box">
                                    <div className="image-box">
                                        <figure className="image"><Image src="/assets/images/resource/working-3.jpg" alt="Image" width={250} height={250} priority /></figure>
                                        <span className="count-text">03</span>
                                    </div>
                                    <div className="lower-content">
                                        <h3>Enjoy Healthy Life</h3>
                                        <p>On the other hand, we denounce with righteous indignation.</p>
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
