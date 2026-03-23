import CountUp from "react-countup";

export default function Funfact() {
  return (
    <section className="funfact-section">
      {/* Background patterns */}
      <div className="pattern-layer">
        <div className="pattern-1">
          <svg
            width="318"
            height="131"
            viewBox="0 0 318 131"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 69.0468L74.0685 69.0468L98.2276 40.7213L125.459 121L164.762 10L191.919 105.268L208.417 57.4162L233.167 87.0291L249.076 69.0468L308 69.0468"
              stroke="#BDBDBD"
              strokeOpacity="0.15"
              strokeWidth="20"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          className="pattern-2"
          style={{ backgroundImage: "url(/assets/images/shape/shape-35.png)" }}
        ></div>
      </div>

      <div className="auto-container">
        <div className="inner-container">
          <div
            className="shape"
            style={{ backgroundImage: "url(/assets/images/shape/shape-34.png)" }}
          ></div>

          <div className="row clearfix">
            {/* Block 1 */}
            <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
              <div className="funfact-block-two">
                <div className="inner-box">
                  <div className="icon-box">
                    <i className="icon-37"></i>
                  </div>
                  <div className="count-outer count-box">
                    <CountUp end={180} duration={1.5} />
                    <span>+</span>
                  </div>
                  <p>Expert Doctors</p>
                </div>
              </div>
            </div>

            {/* Block 2 */}
            <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
              <div className="funfact-block-two">
                <div className="inner-box">
                  <div className="icon-box">
                    <i className="icon-38"></i>
                  </div>
                  <div className="count-outer count-box">
                    <CountUp end={12.2} duration={1.5} decimals={1} />
                    <span>+</span>
                  </div>
                  <p>Different Services</p>
                </div>
              </div>
            </div>

            {/* Block 3 */}
            <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
              <div className="funfact-block-two">
                <div className="inner-box">
                  <div className="icon-box">
                    <i className="icon-39"></i>
                  </div>
                  <div className="count-outer count-box">
                    <CountUp end={200} duration={1.5} />
                    <span>+</span>
                  </div>
                  <p>Multi Services</p>
                </div>
              </div>
            </div>

            {/* Block 4 */}
            <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
              <div className="funfact-block-two">
                <div className="inner-box">
                  <div className="icon-box">
                    <i className="icon-40"></i>
                  </div>
                  <div className="count-outer count-box">
                    <CountUp end={8} duration={1.5} />
                  </div>
                  <p>Awards Win</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
