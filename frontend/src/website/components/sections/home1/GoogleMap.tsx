import { Link } from "react-router-dom";
export default function GoogleMapSection() {
  return (
        <section className="google-map-section">
            <div className="map-inner">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15555.200144414943!2d77.49867088715823!3d12.92057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3e556c40033f%3A0x63047169f2577e88!2sAARMS%20Value%20Chain%20Private%20Limited!5e0!3m2!1sen!2sin!4v1743398075591!5m2!1sen!2sin" style={{ border: 0, width: "100%", height: "min(570px, 60vw)", minHeight: "250px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="content-box">
                <div className="inner-box">
                    <h3>Working Hour:</h3>
                    <div className="content-inner">
                        <ul className="schedule-list clearfix">
                            <li>Mon - Fri: <span>9:30AM - 6:00PM</span></li>
                            <li>Sat: <span>9:30AM - 2:30PM</span></li>
                            <li>Sun: <span>Closed</span></li>
                        </ul>
                        <h4>Contact Info:</h4>
                        <ul className="info-list clearfix">
                            <li><i className="icon-46"></i>Email: <Link to="mailto:support@miisky.com">support@miisky.com</Link></li>
                            <li><i className="icon-35"></i>Call :<Link to="tel:+919845497950">+91 9845497950</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
  );
}
