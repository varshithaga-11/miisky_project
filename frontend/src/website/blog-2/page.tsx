import { useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import ModalVideo from "../components/elements/VideoPopup";
import Cta from "../components/sections/home2/Cta";
export default function BlogStandardPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Blog Standard");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    return (
        <div className="boxed_wrapper">
                <section className="sidebar-page-container pt_120 pb_120">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="blog-standard-content">
                                    <div className="news-block-one">
                                        <div className="inner-box">
                                            <figure className="image-box"><Link to="/website/blog-details"><Image src="/website/assets/images/news/news-7.jpg" alt="Image" width={856} height={425} priority /></Link></figure>
                                            <div className="lower-content">
                                                <span className="comment-box">2Comment</span>
                                                <h3><Link to="/website/blog-details">Prepare to Speak with Your Eye Specialist.</Link></h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>March 6, 2023</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">Author</Link></li>
                                                </ul>
                                                <p>Medical science is a field that deals with the diagnosis, treatment, and prevention of diseases and injuries. It encompasses a wide range of disciplines, including anatomy, physiology, pharmacology, microbiology, pathology, and many others.</p>
                                                <div className="link">
                                                    <Link to="/website/blog-details">Read More</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="news-block-one">
                                        <div className="inner-box">
                                            <figure className="image-box"><Link to="/website/blog-details"><Image src="/website/assets/images/news/news-8.jpg" alt="Image" width={856} height={425} priority /></Link></figure>
                                            <div className="lower-content">
                                                <span className="comment-box">1 Comment</span>
                                                <h3><Link to="/website/blog-details">Prepare to Speak with Your Eye Specialist.</Link></h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>March 5, 2023</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">Author</Link></li>
                                                </ul>
                                                <p>Medical science is a field that deals with the diagnosis, treatment, and prevention of diseases and injuries. It encompasses a wide range of disciplines, including anatomy, physiology, pharmacology, microbiology, pathology, and many others.</p>
                                                <div className="link">
                                                    <Link to="/website/blog-details">Read More</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="news-block-one">
                                        <div className="inner-box">
                                            <figure className="image-box">
                                                <Image src="/website/assets/images/news/news-9.jpg" alt="Image" width={856} height={425} priority />
                                                <ModalVideo />
                                            </figure>
                                            <div className="lower-content">
                                                <span className="comment-box">4 Comment</span>
                                                <h3><Link to="/website/blog-details">Prepare to Speak with Your Eye Specialist.</Link></h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>March 4, 2023</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">Author</Link></li>
                                                </ul>
                                                <p>Medical science is a field that deals with the diagnosis, treatment, and prevention of diseases and injuries. It encompasses a wide range of disciplines, including anatomy, physiology, pharmacology, microbiology, pathology, and many others.</p>
                                                <div className="link">
                                                    <Link to="/website/blog-details">Read More</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pagination-wrapper centred">
                                        <ul className="pagination clearfix">
                                            <li><Link to="/website/blog-2"><i className="icon-21"></i></Link></li>
                                            <li><Link to="/website/blog-2" className="current">01</Link></li>
                                            <li><Link to="/website/blog-2">02</Link></li>
                                            <li className="dotted"><Image src="/website/assets/images/icons/icon-21.svg" alt="Image" width={23} height={5} priority /></li>
                                            <li><Link to="/website/blog-2"><i className="icon-22"></i></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                                <div className="blog-sidebar">
                                    <div className="search-widget mb_40">
                                        <h3>Search Here</h3>
                                        <form method="post" action="/website/blog-2">
                                            <div className="form-group">
                                                <input type="search" name="search-field" placeholder="keywords" required/>
                                                <button type="submit"><Image src="/website/assets/images/icons/icon-22.svg" alt="Icon" width={20} height={20} priority /></button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="sidebar-widget category-widget mb_40">
                                        <div className="widget-title">
                                            <h3>Category</h3>
                                        </div>
                                        <div className="widget-content">
                                            <ul className="category-list clearfix">
                                                <li><Link to="/website/blog-details">Cardiology</Link></li>
                                                <li><Link to="/website/blog-details">Dental</Link></li>
                                                <li><Link to="/website/blog-details">Gastroenterology</Link></li>
                                                <li><Link to="/website/blog-details">Neurology</Link></li>
                                                <li><Link to="/website/blog-details">Orthopaedics</Link></li>
                                                <li><Link to="/website/blog-details">Dental Caring</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget post-widget mb_40">
                                        <div className="widget-title">
                                            <h3>Latest News</h3>
                                        </div>
                                        <div className="post-inner">
                                            <div className="post">
                                                <figure className="post-thumb"><Link to="/website/blog-details"><Image src="/website/assets/images/news/post-1.jpg" alt="Image" width={100} height={101} priority /></Link></figure>
                                                <h3><Link to="/website/blog-details">Prepare to Speak with Your Eye Specialist.</Link></h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>March 6, 2023</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">Author</Link></li>
                                                </ul>
                                            </div>
                                            <div className="post">
                                                <figure className="post-thumb"><Link to="/website/blog-details"><Image src="/website/assets/images/news/post-2.jpg" alt="Image" width={100} height={101} priority /></Link></figure>
                                                <h3><Link to="/website/blog-details">From Diagnosis to Cure: The Role.</Link></h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>March 5, 2023</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">Author</Link></li>
                                                </ul>
                                            </div>
                                            <div className="post">
                                                <figure className="post-thumb"><Link to="/website/blog-details"><Image src="/website/assets/images/news/post-3.jpg" alt="Image" width={100} height={101} priority /></Link></figure>
                                                <h3><Link to="/website/blog-details">Empowering Patients in through</Link></h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>March 4, 2023</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">Author</Link></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="consulting-widget">
                                        <div className="bg-layer" style={{ backgroundImage: "url(/website/assets/images/resource/sidebar-1.jpg)" }}></div>
                                        <h3>Get Free <br />Consultations Today!</h3>
                                        <p>Speak with our expert team and receive professional advice on your next project. No obligation, no cost. Schedule your consultation now!</p>
                                        <Link to="/website/contact" className="theme-btn btn-two"><span>get a quote</span></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Cta/>
        </div>
    )
}
