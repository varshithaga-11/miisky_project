import { useEffect, useState } from "react";
import { useLayout } from "../context/LayoutContext";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import ModalVideo from "../components/elements/VideoPopup";
import Cta from "../components/sections/home2/Cta";
import { getBlogPosts } from "../../utils/api";
import { MOCK_BLOG_POSTS } from "../utils/mockData";

export default function BlogStandardPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [posts, setPosts] = useState(MOCK_BLOG_POSTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Blog Standard");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await getBlogPosts();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setPosts(data.length > 0 ? data : MOCK_BLOG_POSTS);
            } catch (err) {
                console.warn('Failed to fetch blog posts:', err);
                setPosts(MOCK_BLOG_POSTS);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

    return (
        <div className="boxed_wrapper">
                <section className="sidebar-page-container pt_120 pb_120">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="blog-standard-content">
                                    {posts.map((post: any) => (
                                        <div key={post.id} className="news-block-one mb_30">
                                            <div className="inner-box">
                                                <figure className="image-box">
                                                    <Link to={`/website/blog-details/${post.id}`}>
                                                        <Image src={post.featured_image || post.image || "/website/assets/images/news/news-7.jpg"} alt={post.title} width={856} height={425} priority />
                                                    </Link>
                                                    {post.has_video && <ModalVideo />}
                                                </figure>
                                                <div className="lower-content">
                                                    <span className="comment-box">{post.comment_count || 0} Comment</span>
                                                    <h3><Link to={`/website/blog-details/${post.id}`}>{post.title}</Link></h3>
                                                    <ul className="post-info clearfix">
                                                        <li><i className="icon-59"></i>{new Date(post.published_at || post.created_at || new Date()).toLocaleDateString()}</li>
                                                        <li><i className="icon-60"></i><Link to={`/website/blog-details/${post.id}`}>{post.author || "Admin"}</Link></li>
                                                    </ul>
                                                    <p>{post.excerpt || post.description || (post.content && post.content.substring(0, 200) + "...") || "No content available."}</p>
                                                    <div className="link">
                                                        <Link to={`/website/blog-details/${post.id}`}>Read More</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pagination-wrapper centred mt_40">
                                        <ul className="pagination clearfix">
                                            <li><Link to="/website/blog-standard"><i className="icon-21"></i></Link></li>
                                            <li><Link to="/website/blog-standard" className="current">01</Link></li>
                                            <li><Link to="/website/blog-standard">02</Link></li>
                                            <li className="dotted"><Image src="/website/assets/images/icons/icon-21.svg" alt="Image" width={23} height={5} priority /></li>
                                            <li><Link to="/website/blog-standard"><i className="icon-22"></i></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                                <div className="blog-sidebar">
                                    <div className="search-widget mb_40">
                                        <h3>Search Here</h3>
                                        <form method="post" action="/website/blog-standard">
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
                                                <li><Link to="/website/blog">Cardiology</Link></li>
                                                <li><Link to="/website/blog">Dental</Link></li>
                                                <li><Link to="/website/blog">Gastroenterology</Link></li>
                                                <li><Link to="/website/blog">Neurology</Link></li>
                                                <li><Link to="/website/blog">Orthopaedics</Link></li>
                                                <li><Link to="/website/blog">Dental Caring</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget post-widget mb_40">
                                        <div className="widget-title">
                                            <h3>Latest News</h3>
                                        </div>
                                        <div className="post-inner">
                                            {posts.slice(0, 3).map((latestPost: any) => (
                                                <div key={latestPost.id} className="post">
                                                    <figure className="post-thumb"><Link to={`/website/blog-details/${latestPost.id}`}><Image src={latestPost.featured_image || latestPost.image || "/website/assets/images/news/post-1.jpg"} alt={latestPost.title} width={100} height={101} priority /></Link></figure>
                                                    <h3><Link to={`/website/blog-details/${latestPost.id}`}>{latestPost.title}</Link></h3>
                                                    <ul className="post-info clearfix">
                                                        <li><i className="icon-59"></i>{new Date(latestPost.published_at || latestPost.created_at || new Date()).toLocaleDateString()}</li>
                                                        <li><i className="icon-60"></i><Link to="/website/blog">{latestPost.author || "Author"}</Link></li>
                                                    </ul>
                                                </div>
                                            ))}
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
