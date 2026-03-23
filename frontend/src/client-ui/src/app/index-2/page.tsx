
import Layout from "../../../components/layout/Layout";
import Working from "../../../components/sections/home2/Working";
import About from "../../../components/sections/home2/About";
import AboutTwo from "../../../components/sections/home2/About_Two";
import Banner from "../../../components/sections/home2/Banner";
import Chooseus from "../../../components/sections/home2/Chooseus";
import Service from "../../../components/sections/home2/Service";
import Portfolio from "../../../components/sections/home2/Portfolio";
import News from "../../../components/sections/home1/News";
import Cta from "../../../components/sections/home2/Cta";
export default function Home_Two() {

    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={2} footerStyle={1}>
                <Banner/>
                <About/>
                <Service/>
                <AboutTwo/>
                <Chooseus/>
                <Working/>
                <Portfolio/>
                <News/>
                <Cta/>
            </Layout>
        </div>
    )
}
