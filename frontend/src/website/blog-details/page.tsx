import Layout from "../components/layout/Layout";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import Cta from "../components/sections/home2/Cta";
export default function Departments_Details() {

    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={3} footerStyle={1} breadcrumbTitle="Blog Details">
                <section className="sidebar-page-container pt_120 pb_120">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="blog-details-content">
                                    <div className="news-block-one">
                                        <div className="inner-box">
                                            <figure className="image-box"><Image src="/website/assets/images/news/news-7.jpg" alt="Image" width={856} height={425} priority /></figure>
                                            <div className="lower-content">
                                                <span className="comment-box">2Comment</span>
                                                <h3>Prepare to Speak with Your Eye Specialist.</h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>March 6, 2023</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">Author</Link></li>
                                                </ul>
                                                <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various illnesses, injuries, and diseases. It involves a wide range of healthcare professionals such as doctors, nurses, pharmacists, therapists, and many more, who work together to provide the best possible care for patients. Medical care encompasses various aspects of healthcare, including primary care, specialty care, urgent care, emergency care, and long-term care. Primary care is often the first point of contact for patients seeking medical attention and includes routine check-ups, screenings, and preventive care. Specialty care focuses on specific medical conditions or diseases, such as cardiology, oncology, or neurology. Urgent care provides immediate medical attention for non-life-threatening conditions, while emergency care is reserved for life-threatening situations. Medical care also involves the use of advanced medical technologies and treatments such as surgeries, imaging tests, laboratory tests, and medications. Medical research and development continually improve the effectiveness of treatments and the quality of care provided to patients. In addition to treating illnesses and injuries, medical care also emphasizes the importance of preventive care, such as regular check-ups, vaccinations, and lifestyle modifications, to help patients maintain optimal health and well-being. Overall, medical care plays a crucial role in promoting and maintaining good health and quality of life for individuals, families, and communities. It is essential for people to have access to high-quality medical care, regardless of their socioeconomic status or geographical location.</p>
                                                <blockquote>
                                                    <h2>How Pauloag&apos;s Conversion Optimization Techniques Inform His Design Work</h2>
                                                    <span className="designation">Jane Cooper</span>
                                                </blockquote>
                                                <p>In addition to treating illnesses and injuries, medical care also emphasizes the importance of preventive care, such as regular check-ups, vaccinations, and lifestyle modifications, to help patients maintain optimal health and well-being.teh Overall, medical care plays a crucial role in promoting and maintaining good health and quality of life for individuals, shfamilies, and communities. It is essential for people to have access to high-quality medical care, regardless of their socioeconomic status or geographical location.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="post-share-option mb_60">
                                        <ul className="post-tags clearfix">
                                            <li><h4>Tags:</h4></li>
                                            <li><Link to="/website/blog-details">Medical</Link></li>
                                            <li><Link to="/website/blog-details">Surgery</Link></li>
                                            <li><Link to="/website/blog-details">Doctors</Link></li>
                                        </ul>
                                        <ul className="post-share clearfix">
                                            <li><h4>Share:</h4></li>
                                            <li><Link to="/website/blog-details"><i className="fab fa-facebook-f"></i></Link></li>
                                            <li><Link to="/website/blog-details"><i className="fab fa-dribbble"></i></Link></li>
                                            <li><Link to="/website/blog-details"><i className="fab fa-twitter"></i></Link></li>
                                        </ul>
                                    </div>
                                    <div className="author-box mb_60">
                                        <figure className="author-thumb"><Image src="/website/assets/images/news/author-1.jpg" alt="Image" width={172} height={172} priority /></figure>
                                        <h3>Jane Cooper</h3>
                                        <p>In addition to treating illnesses and injuries, medical care also emphasizes the importance of preventive care, such as regular check-ups, vaccinations, and lifestyle modifications, to help patients maintain optimal health and well-being.</p>
                                        <ul className="social-links clearfix">
                                            <li><Link to="/website/blog-details"><i className="fab fa-facebook-f"></i></Link></li>
                                            <li><Link to="/website/blog-details"><i className="fab fa-dribbble"></i></Link></li>
                                            <li><Link to="/website/blog-details"><i className="fab fa-twitter"></i></Link></li>
                                        </ul>
                                    </div>
                                    <div className="comment-box mb_60">
                                        <h3>Comments(02)</h3>
                                        <div className="comment">
                                            <figure className="thumb-box"><Image src="/website/assets/images/news/comment-1.jpg" alt="Image" width={88} height={86} priority /></figure>
                                            <h4>Farrel Collins<span>March 19, 2022</span></h4>
                                            <p>Cum amet sagittis convallis lacus arcu. Ultricies tempor diam facilisi erat dictum. Egestas eu vitae suspendisse nunc quis nisi egestas lorem. Purus lacus, fames commodo velit gravida lacus, sed turpis. Consequat, faucibus nec egestas nisl convallis.</p>
                                            <Link to="/website/blog-details" className="reply-btn"><i className="icon-58"></i></Link>
                                        </div>
                                        <div className="comment replay-comment">
                                            <figure className="thumb-box"><Image src="/website/assets/images/news/comment-2.jpg" alt="Image" width={88} height={86} priority /></figure>
                                            <h4>Jane Cooper<span>March 19, 2022</span></h4>
                                            <p>Cum amet sagittis convallis lacus arcu. Ultricies tempor diam facilisi erat dictum. Egestas eu vitae suspendisse nunc quis nisi egestas lorem. Purus lacus, fames commodo velit gravida lacus, sed turpis. Consequat.</p>
                                            <Link to="/website/blog-details" className="reply-btn"><i className="icon-58"></i></Link>
                                        </div>
                                    </div>
                                    <div className="comment-form">
                                        <h3>Leave a Reply</h3>
                                        <form method="post" action="/website/blog-details" className="default-form">
                                            <div className="row clearfix">
                                                <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                                                    <input type="text" name="name" placeholder="Name" required/>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                                                    <input type="email" name="email" placeholder="Email" required/>
                                                </div>
                                                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                                                    <textarea name="message" placeholder="Type Comment Here ..."></textarea>
                                                </div>
                                                <div className="col-lg-12 col-md-12 col-sm-12 form-group message-btn">
                                                    <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                                <div className="blog-sidebar">
                                    <div className="search-widget mb_40">
                                        <h3>Search Here</h3>
                                        <form method="post" action="/website/blog-details">
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
            </Layout>
        </div>
    )
}
