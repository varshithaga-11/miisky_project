
import { useEffect } from "react";
import { useLayout } from '@website/context/LayoutContext';
import Portfolio from "../components/sections/home1/Portfolio";
import About from "../components/sections/home3/About";
import Banner from "../components/sections/home3/Banner";
import Clients from "../components/sections/home3/Clients";
import Contact_Info from "../components/sections/home3/Contact_Info";
import Download from "../components/sections/home3/Download";
import Faq from "../components/sections/home3/Faq";
import Funfact from "../components/sections/home3/Funfact";
import News from "../components/sections/home3/News";
import Service from "../components/sections/home3/Service";
import Subscribe from "../components/sections/home3/Subscribe";
import Testimonial from "../components/sections/home3/Testimonial";
import Video from "../components/sections/home3/Video";
export default function Home_Three() {
    const { setHeaderStyle } = useLayout();

    useEffect(() => {
        setHeaderStyle(1);
    }, [setHeaderStyle]);

    return (
        <div className="boxed_wrapper">
                <Banner/>
                <Service/>
                <About/>
                <Video/>
                <Contact_Info/>
                <Faq/>
                <Funfact/>
                <Testimonial/>
                <Clients/>
                <Portfolio/>
                <Download/>
                <News/>
                <Subscribe/>
        </div>
    )
}
