import { useState, useEffect } from "react";

export default function ToggleBodyClass() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [isActive]);

  return (

    <div className="page_direction" onClick={() => setIsActive(!isActive)}>
      <div className="demo-rtl"><button className="rtl"><span>RTL</span><span>Ltr</span></button></div>
    </div>

  )
}