import Image from "../../Image";
import { Link } from "react-router-dom";
export default function Banner() {
  return (
        <section className="banner-style-two p_relative">
            <span className="big-text">miisky</span>
            <div className="bg-layer" style={{ backgroundImage: "url(/website/assets/images/banner/banner-1.jpg)" }}></div>
            <div className="pattern-layer">
                <div className="pattern-1" style={{ backgroundImage: "url(/website/assets/images/shape/shape-25.png)" }}></div>
                <div className="pattern-2" style={{ backgroundImage: "url(/website/assets/images/shape/shape-26.png)" }}></div>
                <div className="pattern-3" style={{ backgroundImage: "url(/website/assets/images/shape/shape-27.png)" }}></div>
            </div>
            <div className="auto-container">
                <div className="content-box">
                    <span className="sub-title">Your Health is our Priority</span>
                    <h2>Stay Healthy, <span>Stay Happy</span></h2>
                    <p>In addition to treating illnesses and injuries, medical care also emphasizes the importance of preventive care, such as regular check-ups, vaccinations, and lifestyle modifications.</p>
                    <div className="lower-box">
                        <div className="btn-box"><Link to="/website/index-2" className="theme-btn btn-two"><span>Read More</span></Link></div>
                        <div className="doctors-list">
                            <ul className="thumb-box clearfix">
                                <li><Image src="/website/assets/images/banner/thumb-1.jpg" alt="Image" width={45} height={45} priority /></li>
                                <li><Image src="/website/assets/images/banner/thumb-2.jpg" alt="Image" width={45} height={45} priority /></li>
                                <li><Image src="/website/assets/images/banner/thumb-3.jpg" alt="Image" width={45} height={45} priority /></li>
                                <li><Image src="/website/assets/images/banner/thumb-4.jpg" alt="Image" width={45} height={45} priority /></li>
                            </ul>
                            <h3>100K</h3>
                            <span>Professional Doctors</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
}
