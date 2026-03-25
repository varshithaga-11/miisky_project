import Image from "../../Image";
import { Link } from "react-router-dom";
export default function Cta() {
  return (
        <section className="cta-section">
            <div className="auto-container">
                <div className="inner-container">
                    <div className="content-box">
                        <h2>Need a Doctor for Check-up? Call for an Emergency Service!</h2>
                        <div className="support-box">
                            <div className="icon-box"><Image src="/website/assets/images/icons/icon-8.svg" alt="Image" width={34} height={34} priority /></div>
                            <span>Call: <Link to="tel:112345615523">+1 (123)-456-155-23</Link></span>
                        </div>
                    </div>
                    <figure className="image-layer"><Image src="/website/assets/images/resource/ambulance-1.png" alt="Image" width={576} height={303} priority /></figure>
                </div>
            </div>
        </section>
  );
}
