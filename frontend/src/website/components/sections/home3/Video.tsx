import ModalVideo from "../../elements/VideoPopup";
export default function Video() {
  return (
        <section className="video-section p_relative centred">
            <div className="bg-layer parallax-bg"  style={{ backgroundImage: "url(/website/assets/images/background/company.jpg)" }}></div>
            <div className="auto-container">
                <div className="content-box">
                    <div className="video-btn">
                        <ModalVideo />
                    </div>
                    <h2>Lets Watch Our Recent Work</h2>
                </div>
            </div>
        </section>
  );
}
