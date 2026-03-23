import { Link } from "react-router-dom";
export default function GoogleMapSection() {
  return (
        <section className="google-map-section">
            <div className="map-inner">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2643.6895046810805!2d-122.52642526124438!3d38.00014098339506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085976736097a2f%3A0xbe014d20e6e22654!2sSan Rafael%2C California%2C Hoa Kỳ!5e0!3m2!1svi!2s!4v1678975266976!5m2!1svi!2s" height={570} style={{ border: 0, width: "100%" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="content-box">
                <div className="inner-box">
                    <h3>Working Hour:</h3>
                    <div className="content-inner">
                        <ul className="schedule-list clearfix">
                            <li>Mon - Wed: <span>8:00AM - 7:00PM</span></li>
                            <li>Thu: <span>8:00AM - 7: 00PM</span></li>
                            <li>Fri: <span>8:00AM - 7:00PM</span></li>
                            <li>Sat - Sun: <span>8:00AM - 7:00PM</span></li>
                        </ul>
                        <h4>Contact Info:</h4>
                        <ul className="info-list clearfix">
                            <li><i className="icon-46"></i>Email: <Link to="mailto:info@yourmail.com">info@yourmail.com</Link></li>
                            <li><i className="icon-35"></i>Call :<Link to="tel:123045615523">+1 (230)-456-155-23</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
  );
}
