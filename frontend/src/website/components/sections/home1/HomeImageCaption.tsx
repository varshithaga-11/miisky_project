import Image from '@website/components/Image';

/** Edit these for final content. */
const PLACEHOLDER_IMAGE_SRC = "/images/homeimg/Picture1.png";
const PLACEHOLDER_IMAGE_ALT = "NiSENSE health monitoring ecosystem";
const PLACEHOLDER_TAGLINE = "Innovation in care";
const PLACEHOLDER_HEADING = "Non-invasive multi-modal health monitoring";
const PLACEHOLDER_CAPTION =
  "NiSENSE is a NON-INVASIVE MULTI-MODAL HEALTH MONITORING ECOSYSTEM USING MULTI-WAVELENGTH OPTICAL SENSING, BIOPOTENTIAL (ECG) ACQUISITION, RESPIRATORY MONITORING, AND BIOFLUID AND SKIN-INTERFACE SENSING VIA WEARABLE, CAPILLARY-SITE INTERFACES, HANDHELD DEVICES, AND COMMUNITY SCREENING KIOSKS, WITH AI/ML-BASED ANALYTICS FOR TREND MONITORING, PREDICTIVE INSIGHTS, AND CONTINUOUS AND ON-DEMAND HEALTH ";

/** Three-up gallery: set src (e.g. under /images/homeimg/) and alt for each slot. */
const GALLERY_IMAGES: { src: string; alt: string }[] = [
  { src: "/images/homeimg/Picture2.jpg", alt: "NiSENSE highlight one" },
  { src: "/images/homeimg/Picture3.jpg", alt: "NiSENSE highlight two" },
  { src: "/images/homeimg/Picture4.png", alt: "NiSENSE highlight three" },
];
const CENTER_IMAGE_SRC = "/images/homeimg/Picture5.png";
const CENTER_IMAGE_ALT = "NiSENSE centered highlight";
const SECONDARY_IMAGE_SRC = "/images/homeimg/Picture6.png";
const SECONDARY_IMAGE_ALT = "NiSENSE ecosystem overview";
const SECONDARY_TAGLINE = "PERSONALISED HEALTH FOODS";
const SECONDARY_HEADING = "Health based End to End Food Management Solutions";
const SECONDARY_CAPTION =
  "NEATS is a Health based End to End Food Management Solutions. NEATS is focused in PERSONALISED HEALTH FOODS, curated by NUTRITIONAL EXPERTS, cooked and delivered by MICRO KITCHEN and delivered by SUPPLY CHAIN managers. ";

export default function HomeImageCaption() {
  return (
    <section className="home-image-caption-section p_relative pt_120 pb_120">
      <div className="auto-container">
        <div className="row clearfix align-items-center">
          <div className="col-lg-6 col-md-12 col-sm-12 image-column mb_40 mb-lg-0">
            <div className="home-image-caption-media">
              <Image
                src={PLACEHOLDER_IMAGE_SRC}
                alt={PLACEHOLDER_IMAGE_ALT}
                className="home-image-caption-img"
              />
            </div>
          </div>
          <div className="col-lg-6 col-md-12 col-sm-12 content-column">
            <div className="home-image-caption-content">
              <div className="sec-title mb_25">
                <span className="sub-title mb_5">{PLACEHOLDER_TAGLINE}</span>
                <h2>{PLACEHOLDER_HEADING}</h2>
              </div>
              <div className="home-image-caption-divider" aria-hidden="true" />
              <div className="text-box">
                <p className="home-image-caption-text">{PLACEHOLDER_CAPTION}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="home-image-caption-gallery">
          <div className="row clearfix">
            {GALLERY_IMAGES.map((item, index) => (
              <div
                key={`${item.src}-${index}`}
                className="col-lg-4 col-md-4 col-sm-12 home-image-caption-gallery-col"
              >
                <div className="home-image-caption-gallery-card">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    className="home-image-caption-gallery-img"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="home-image-caption-center-wrap">
          <div className="home-image-caption-center-card">
            <Image
              src={CENTER_IMAGE_SRC}
              alt={CENTER_IMAGE_ALT}
              width={891}
              height={891}
              className="home-image-caption-center-img"
            />
          </div>
        </div>

        <div className="home-image-caption-secondary">
          <div className="row clearfix align-items-center">
            <div className="col-lg-6 col-md-12 col-sm-12 image-column mb_40 mb-lg-0">
              <div className="home-image-caption-secondary-media">
                <Image
                  src={SECONDARY_IMAGE_SRC}
                  alt={SECONDARY_IMAGE_ALT}
                  className="home-image-caption-secondary-img"
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-sm-12 content-column">
              <div className="home-image-caption-content">
                <div className="sec-title mb_25">
                  <span className="sub-title mb_5">{SECONDARY_TAGLINE}</span>
                  <h2>{SECONDARY_HEADING}</h2>
                </div>
                <div className="home-image-caption-divider" aria-hidden="true" />
                <div className="text-box">
                  <p className="home-image-caption-text">{SECONDARY_CAPTION}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
