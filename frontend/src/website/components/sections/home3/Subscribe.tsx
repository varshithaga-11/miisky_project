import Image from "../../Image";

export default function Subscribe() {
  return (
    <section className="subscribe-section">
      <div className="auto-container">
        <div className="inner-container">
          <div className="row clearfix">

            {/* Content Column */}
            <div className="col-lg-6 col-md-12 col-sm-12 content-column">
              <div className="content-box">
                <div className="light-icon">
                  <Image
                    src="/website/assets/images/icons/icon-16.svg"
                    alt="Light Icon"
                    width={100}
                    height={100}
                  />
                </div>
                <h2>Emergency Call</h2>
                <div className="support-box">
                  <div className="icon-box">
                    <Image
                      src="/website/assets/images/icons/icon-17.svg"
                      alt="Telephone Icon"
                      width={45}
                      height={45}
                    />
                  </div>
                  <span>Telephone</span>
                  <a href="tel:111454564567">+ (111) 45 456 4567</a>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="col-lg-6 col-md-12 col-sm-12 form-column">
              <div className="form-inner">
                <h2>Sign up for Email</h2>
                <form method="post" action="/website/contact">
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      required
                    />
                    <button type="submit">Submit Now</button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
