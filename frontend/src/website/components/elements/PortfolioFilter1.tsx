import Image from "../Image";
import { Link } from "react-router-dom";
import Isotope from "isotope-layout";
import { useEffect, useRef, useState, useCallback } from "react";

interface PortfolioFilterProps {
  defaultFilter?: 1;
}

export default function PortfolioFilter1({}: PortfolioFilterProps) {
  const isotope = useRef<Isotope | null>(null);
  const [filterKey, setFilterKey] = useState("*");

  // Initialize Isotope
  useEffect(() => {
    const iso = new Isotope(".items-container", {
      itemSelector: ".masonry-item",
      percentPosition: true,
      masonry: { columnWidth: ".masonry-item" },
      transitionDuration: "0.75s",
    });
    isotope.current = iso;

    return () => iso.destroy();
  }, []);

  // Apply filter
  useEffect(() => {
    if (isotope.current) {
      filterKey === "*"
        ? isotope.current.arrange({ filter: "*" })
        : isotope.current.arrange({ filter: `.${filterKey}` });
    }
  }, [filterKey]);

  const handleFilterKeyChange = useCallback(
    (key: string) => () => setFilterKey(key),
    []
  );

  const activeBtn = (value: string) => (value === filterKey ? "filter active" : "filter");

  return (
    <div className="outer-container">
      <div className="sortable-masonry">
        <div className="filters centred mb_60">
            <ul className="filter-tabs filter-btns clearfix">
              <li className={activeBtn("*")} onClick={handleFilterKeyChange("*")}>
                All
              </li>
              <li className={activeBtn("cat-2")} onClick={handleFilterKeyChange("cat-2")}>
                Surgical
              </li>
              <li className={activeBtn("cat-3")} onClick={handleFilterKeyChange("cat-3")}>
                Paediatric
              </li>
              <li className={activeBtn("cat-4")} onClick={handleFilterKeyChange("cat-4")}>
                Lenses
              </li>
              <li className={activeBtn("cat-5")} onClick={handleFilterKeyChange("cat-5")}>
                Equipment
              </li>
            </ul>
        </div>

        <div className="items-container row clearfix">
          {/* Example item */}
          <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column cat-1 cat-2 cat-4 cat-5">
            <div className="portfolio-block-one">
                <div className="inner-box">
                    <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-1.jpg" alt="Image" width={416} height={520} priority /></figure>
                    <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-1.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                    <div className="text-box">
                        <h3><Link to="/website">Regular Dental Cleaning</Link></h3>
                        <span>Residential</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column at-1 cat-3 cat-5 cat-2">
            <div className="portfolio-block-one">
                <div className="inner-box">
                    <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-2.jpg" alt="Image" width={416} height={520} priority /></figure>
                    <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-2.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                    <div className="text-box">
                        <h3><Link to="/website">Prepare to Speak</Link></h3>
                        <span>Residential</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column cat-1 cat-2 cat-4 cat-5">
            <div className="portfolio-block-one">
              <div className="inner-box">
                  <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-7.jpg" alt="Image" width={416} height={520} priority /></figure>
                  <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-3.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                  <div className="text-box">
                      <h3><Link to="/website">From Diagnosis to Cure</Link></h3>
                      <span>Residential</span>
                  </div>
              </div>
          </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column cat-1 cat-3 cat-5 cat-4">
            <div className="portfolio-block-one">
              <div className="inner-box">
                  <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-8.jpg" alt="Image" width={416} height={520} priority /></figure>
                  <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-4.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                  <div className="text-box">
                      <h3><Link to="/website">Empowering Patients</Link></h3>
                      <span>Residential</span>
                  </div>
              </div>
          </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column cat-1 cat-2 cat-4">
            <div className="portfolio-block-one">
              <div className="inner-box">
                  <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-5.jpg" alt="Image" width={416} height={520} priority /></figure>
                  <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-5.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                  <div className="text-box">
                      <h3><Link to="/website">From Healthcare Provider</Link></h3>
                      <span>Residential</span>
                  </div>
              </div>
          </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column cat-1 cat-3 cat-5 cat-2">
            <div className="portfolio-block-one">
              <div className="inner-box">
                  <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-6.jpg" alt="Image" width={416} height={520} priority /></figure>
                  <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-6.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                  <div className="text-box">
                      <h3><Link to="/website">Transforming Health</Link></h3>
                      <span>Residential</span>
                  </div>
              </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column cat-1 cat-2 cat-4">
            <div className="portfolio-block-one">
                <div className="inner-box">
                    <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-1.jpg" alt="Image" width={416} height={520} priority /></figure>
                    <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-1.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                    <div className="text-box">
                        <h3><Link to="/website">Regular Dental Cleaning</Link></h3>
                        <span>Residential</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 masonry-item small-column cat-1 cat-3 cat-5 cat-2">
            <div className="portfolio-block-one">
                <div className="inner-box">
                    <figure className="image-box"><Image src="/website/assets/images/gallery/portfolio-2.jpg" alt="Image" width={416} height={520} priority /></figure>
                    <div className="view-btn"><Link to="/website/assets/images/gallery/portfolio-2.jpg" className="lightbox-image" data-fancybox="gallery"><i className="icon-24"></i></Link></div>
                    <div className="text-box">
                        <h3><Link to="/website">Prepare to Speak</Link></h3>
                        <span>Residential</span>
                    </div>
                </div>
            </div>
        </div>

          {/* Repeat other items similarly */}
        </div>
      </div>
    </div>
  );
}
