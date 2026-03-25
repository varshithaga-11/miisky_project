
import Layout from "./components/layout/Layout";
import About from "./components/sections/home1/About";
import About_Two from "./components/sections/home1/About_Two";
import Appointment from "./components/sections/home1/Appointment";
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
    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={1} footerStyle={1}>
                <Banner/>
                <Contact_Info/>
                <About/>
                <Service/>
                <Chooseus/>
                <Appointment/>
                <Working/>
                <About_Two/>
                <Team/>
                <Portfolio/>
                <News/>
                <GoogleMapSection/>
            </Layout>
        </div>
    )
}
