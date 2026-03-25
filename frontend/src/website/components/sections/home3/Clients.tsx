import Image from "../../Image";
import { Link } from "react-router-dom";
export default function Clients() {
  return (
        <section className="clients-section p_relative sec-pad">
            <div className="pattern-layer" style={{ backgroundImage: "url(/website/assets/images/shape/shape-37.png)" }}></div>
            <div className="auto-container">
                <div className="sec-title centred mb_60 light">
                    <span className="sub-title mb_5">Our Trusted Partners</span>
                    <h2>We&apos;ve 23563k+ Trusted Partners</h2>
                    <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />illnesses, injuries, and diseases. It</p>
                </div>
                <div className="inner-container">
                    <ul className="clients-list mb_70">
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-1.png" alt="Image" width={200} height={53} priority /></Link></li>
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-2.png" alt="Image" width={172} height={65} priority /></Link></li>
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-3.png" alt="Image" width={204} height={53} priority /></Link></li>
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-4.png" alt="Image" width={133} height={63} priority /></Link></li>
                    </ul>
                    <ul className="clients-list">
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-5.png" alt="Image" width={174} height={63} priority /></Link></li>
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-6.png" alt="Image" width={200} height={55} priority /></Link></li>
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-7.png" alt="Image" width={162} height={61} priority /></Link></li>
                        <li><Link to="/website/index-3"><Image src="/website/assets/images/clients/clients-8.png" alt="Image" width={130} height={61} priority /></Link></li>
                    </ul>
                </div>
            </div>
        </section>
  );
}
