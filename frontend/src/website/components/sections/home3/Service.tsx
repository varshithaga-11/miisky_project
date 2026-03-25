import Image from "../../Image";
import { Link } from "react-router-dom";
export default function Service() {
  return (
        <section className="service-style-two">
            <div className="auto-container">
                <div className="inner-container">
                    <div className="pattern-layer">
                        <div className="pattern-1" style={{ backgroundImage: "url(/website/assets/images/shape/shape-30.png)" }}></div>
                        <div className="pattern-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-31.png)" }}></div>
                    </div>
                    <div className="row clearfix">
                        <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                            <div className="service-block-two">
                                <div className="inner-box">
                                    <div className="icon-box">
                                        <div className="icon"><Image src="/website/assets/images/icons/icon-11.svg" alt="Icon" width={60} height={60} priority /></div>
                                        <span className="count-text">01</span>
                                    </div>
                                    <h3><Link to="/website/department-details">Cardiology</Link></h3>
                                    <p>Cardiology is the medical specialty that focuses on the diagnosis.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                            <div className="service-block-two">
                                <div className="inner-box">
                                    <div className="icon-box">
                                        <div className="icon"><Image src="/website/assets/images/icons/icon-12.svg" alt="Icon" width={60} height={60} priority /></div>
                                        <span className="count-text">02</span>
                                    </div>
                                    <h3><Link to="/website/department-details-2">Dental</Link></h3>
                                    <p>Cardiology is the medical specialty that focuses on the diagnosis.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 service-block">
                            <div className="service-block-two">
                                <div className="inner-box">
                                    <div className="icon-box">
                                        <div className="icon"><Image src="/website/assets/images/icons/icon-13.svg" alt="Icon" width={62} height={60} priority /></div>
                                        <span className="count-text">03</span>
                                    </div>
                                    <h3><Link to="/website/department-details-3">Gastroenterology</Link></h3>
                                    <p>Cardiology is the medical specialty that focuses on the diagnosis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
}
