import Image from "../../Image";
import { Link } from "react-router-dom";

export default function News() {
  return (
    <section className="news-section sec-pad">
      <div className="auto-container">
        <div className="sec-title centred mb_60">
          <span className="sub-title mb_5">Latest News</span>
          <h2>
            Resources to Keep You Informed <br /> with Our Blog
          </h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and
            preventive care for various <br />
            illnesses, injuries, and diseases.
          </p>
        </div>

        <div className="row clearfix">
          {/* News Block 1 */}
          <div className="col-lg-4 col-md-6 col-sm-12 news-block">
            <div className="news-block-one">
              <div className="inner-box">
                <figure className="image-box">
                  <Link to="/website/blog-details">
                    <Image
                      src="/website/assets/images/news/news-1.jpg"
                      alt="News 1"
                      width={416}
                      height={287}
                    />
                  </Link>
                </figure>
                <div className="lower-content">
                  <span className="comment-box">2 Comment</span>
                  <h3>
                    <Link to="/website/blog-details">
                      Prepare to Speak with Your Eye Specialist.
                    </Link>
                  </h3>
                  <ul className="post-info clearfix">
                    <li>
                      <i className="icon-59"></i>March 6, 2023
                    </li>
                    <li>
                      <i className="icon-60"></i>
                      <Link to="/website/blog-details">Author</Link>
                    </li>
                  </ul>
                  <p>
                    To provide accessible and equitable healthcare for all
                    individuals, regardless of their or socioeconomic status.
                  </p>
                  <div className="link">
                    <Link to="/website/blog-details">Read More</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* News Block 2 */}
          <div className="col-lg-4 col-md-6 col-sm-12 news-block">
            <div className="news-block-one">
              <div className="inner-box">
                <figure className="image-box">
                  <Link to="/website/blog-details">
                    <Image
                      src="/website/assets/images/news/news-2.jpg"
                      alt="News 2"
                      width={416}
                      height={287}
                    />
                  </Link>
                </figure>
                <div className="lower-content">
                  <span className="comment-box">1 Comment</span>
                  <h3>
                    <Link to="/website/blog-details">
                      Empowering Patients through Medicine
                    </Link>
                  </h3>
                  <ul className="post-info clearfix">
                    <li>
                      <i className="icon-59"></i>March 5, 2023
                    </li>
                    <li>
                      <i className="icon-60"></i>
                      <Link to="/website/blog-details">Author</Link>
                    </li>
                  </ul>
                  <p>
                    To provide accessible and equitable healthcare for all
                    individuals, regardless of their or socioeconomic status.
                  </p>
                  <div className="link">
                    <Link to="/website/blog-details">Read More</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* News Block 3 */}
          <div className="col-lg-4 col-md-6 col-sm-12 news-block">
            <div className="news-block-one">
              <div className="inner-box">
                <figure className="image-box">
                  <Link to="/website/blog-details">
                    <Image
                      src="/website/assets/images/news/news-3.jpg"
                      alt="News 3"
                      width={416}
                      height={287}
                    />
                  </Link>
                </figure>
                <div className="lower-content">
                  <span className="comment-box">6 Comment</span>
                  <h3>
                    <Link to="/website/blog-details">
                      From Diagnosis Role of Medical Research
                    </Link>
                  </h3>
                  <ul className="post-info clearfix">
                    <li>
                      <i className="icon-59"></i>March 4, 2023
                    </li>
                    <li>
                      <i className="icon-60"></i>
                      <Link to="/website/blog-details">Author</Link>
                    </li>
                  </ul>
                  <p>
                    To provide accessible and equitable healthcare for all
                    individuals, regardless of their or socioeconomic status.
                  </p>
                  <div className="link">
                    <Link to="/website/blog-details">Read More</Link>
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
