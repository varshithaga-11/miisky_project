import { useEffect } from "react";
import { useLayout } from '@website/context/LayoutContext';
import About from "./components/sections/home1/About";
// import About_Two from "./components/sections/home1/About_Two";
import Banner from "./components/sections/home1/Banner";
import Chooseus from "./components/sections/home1/Chooseus";
import News from "./components/sections/home1/News";
import Portfolio from "./components/sections/home1/Portfolio";
import Service from "./components/sections/home1/Service";
import Team from "./components/sections/home1/Team";
import Working from "./components/sections/home1/Working";
import GoogleMapSection from "./components/sections/home1/GoogleMap";
import HomeImageCaption from '@website/components/sections/home1/HomeImageCaption';

export default function HomePage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle(undefined);
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <div className="boxed_wrapper">
            <Banner/>
            <About/>
            <Service/>
            <Chooseus/>
            <Working/>
            {/* <About_Two/> */}
            <Team/>
            <Portfolio/>
            <News/>
            <GoogleMapSection/>
            <HomeImageCaption/>
        </div>
    );
}
