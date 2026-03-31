import { useState, useEffect } from "react";
import Image from "../../Image";
import { Link } from "react-router-dom";
import { getPartners, getCompanyInfo } from "../../../../utils/api";
import { Partner } from "../../../utils/types";
import { MOCK_PARTNERS } from "../../../utils/mockData";

export default function Clients() {
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [partnerCount, setPartnerCount] = useState<string>("10k+");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partnersResp = await getPartners();
        const partnersData = Array.isArray(partnersResp.data) ? partnersResp.data : partnersResp.data.results || [];
        if (partnersData.length > 0) {
           setPartners(partnersData.map((p: any) => ({
             id: p.id,
             name: p.name,
             logo: p.logo || "/website/assets/images/logo.png",
             website_url: p.website_url || "#"
           })));
        }

        const infoResp = await getCompanyInfo();
        const info = Array.isArray(infoResp.data) ? infoResp.data[0] : infoResp.data;
        if (info?.satisfied_patients) {
          setPartnerCount(info.satisfied_patients);
        }
      } catch (error) {
        console.warn("Failed to fetch dynamic partner data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="clients-section p_relative sec-pad">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/website/assets/images/shape/shape-37.png)" }}
      ></div>
      <div className="auto-container">
        <div className="sec-title centred mb_60 light">
          <span className="sub-title mb_5">Our Trusted Partners</span>
          <h2>We&apos;ve {partnerCount} Trusted Partners</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and preventive care for
            various <br />
            illnesses, injuries, and diseases. It
          </p>
        </div>
        <div className="inner-container">
          <ul className="clients-list mb_30">
            {partners.map((partner) => (
              <li key={partner.id}>
                <Link to={partner.website_url || "#"}>
                  <div className="image-box" style={{ 
                    background: '#ffffff', 
                    padding: '10px', 
                    borderRadius: '10px',
                    width: '160px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    <Image
                      src={partner.logo || "/website/assets/images/logo.png"}
                      alt={partner.name}
                      style={{ 
                        width: '90%', 
                        height: '90%',
                        objectFit: 'contain'
                      }}
                      priority
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
