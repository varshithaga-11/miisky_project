import { useEffect } from "react";
import { useLayout } from "./context/LayoutContext";
import About from "./components/sections/home1/About";
import About_Two from "./components/sections/home1/About_Two";
import Banner from "./components/sections/home1/Banner";
import Chooseus from "./components/sections/home1/Chooseus";
import Contact_Info from "./components/sections/home1/Contact_Info";
import News from "./components/sections/home1/News";
import Portfolio from "./components/sections/home1/Portfolio";
import Service from "./components/sections/home1/Service";
import Team from "./components/sections/home1/Team";
import Working from "./components/sections/home1/Working";
import GoogleMapSection from "./components/sections/home1/GoogleMap";

export default function HomePage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle(undefined);
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <div className="boxed_wrapper">
            <Banner/>
            <Contact_Info/>
            <About/>
            <Service/>
            <Chooseus/>
            <Working/>
            <About_Two/>
            <Team/>
            <Portfolio/>
            <News/>
            <GoogleMapSection/>
        </div>
    );
}
