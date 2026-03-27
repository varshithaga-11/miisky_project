
import { useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import Working from "../components/sections/home2/Working";
import About from "../components/sections/home2/About";
import AboutTwo from "../components/sections/home2/About_Two";
import Banner from "../components/sections/home2/Banner";
import Chooseus from "../components/sections/home2/Chooseus";
import Service from "../components/sections/home2/Service";
import Portfolio from "../components/sections/home2/Portfolio";
import News from "../components/sections/home1/News";
import Cta from "../components/sections/home2/Cta";
export default function Home_Two() {
    const { setHeaderStyle } = useLayout();

    useEffect(() => {
        setHeaderStyle(2);
    }, [setHeaderStyle]);

    return (
        <div className="boxed_wrapper">
                <Banner/>
                <About/>
                <Service/>
                <AboutTwo/>
                <Chooseus/>
                <Working/>
                <Portfolio/>
                <News/>
                <Cta/>
        </div>
    )
}
