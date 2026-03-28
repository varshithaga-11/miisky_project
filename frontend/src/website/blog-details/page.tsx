import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Cta from "../components/sections/home2/Cta";
import { getBlogPostById, getBlogPosts, createBlogComment } from "../../utils/api";
import { MOCK_BLOG_POSTS } from "../utils/mockData";

export default function BlogDetails() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<any>(null);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentData, setCommentData] = useState({ name: "", email: "", message: "" });
    const [commentStatus, setCommentStatus] = useState({ type: "", message: "" });

    useEffect(() => {
        setHeaderStyle(3);
        setBreadcrumbTitle("Blog Details");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (id) {
                    const response = await getBlogPostById(parseInt(id));
                    setPost(response.data || MOCK_BLOG_POSTS[0]);
                } else {
                    setPost(MOCK_BLOG_POSTS[0]);
                }
            } catch (err) {
                console.warn('Failed to fetch blog post:', err);
                setPost(MOCK_BLOG_POSTS[0]);
            }
        };

        const fetchLatestPosts = async () => {
            try {
                const response = await getBlogPosts();
                const posts = Array.isArray(response.data) ? response.data : response.data.results || [];
                setLatestPosts(posts.slice(0, 3).length > 0 ? posts.slice(0, 3) : MOCK_BLOG_POSTS.slice(0, 3));
            } catch (err) {
                console.warn('Failed to fetch latest posts:', err);
                setLatestPosts(MOCK_BLOG_POSTS.slice(0, 3));
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
        fetchLatestPosts();
    }, [id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        
        setCommentStatus({ type: "info", message: "Submitting comment..." });
        try {
            await createBlogComment({
                blog_post: parseInt(id),
                name: commentData.name,
                email: commentData.email,
                comment: commentData.message
            });
            setCommentStatus({ type: "success", message: "Your comment has been submitted and is awaiting approval!" });
            setCommentData({ name: "", email: "", message: "" });
        } catch (err) {
            console.error("Failed to submit comment:", err);
            setCommentStatus({ type: "danger", message: "Failed to submit comment. Please try again later." });
        }
    };

    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;
    if (!post) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Blog post not found.</div></div>;

    return (
        <div className="boxed_wrapper">
                <section className="sidebar-page-container pt_120 pb_120">
                    <div className="auto-container">
                        <div className="row clearfix">
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="blog-details-content">
                                    <div className="news-block-one">
                                        <div className="inner-box">
                                            <figure className="image-box"><Image src={post.featured_image || post.image || "/website/assets/images/news/news-7.jpg"} alt={post.title} width={856} height={425} priority /></figure>
                                            <div className="lower-content">
                                                <span className="comment-box">{post.comment_count || 0} Comments</span>
                                                <h3>{post.title || "Blog Post"}</h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>{post.created_at || post.published_at ? new Date(post.created_at || post.published_at).toLocaleDateString() : "Date"}</li>
                                                    <li><i className="icon-60"></i><Link to="/website/blog-details">{post.author || "Author"}</Link></li>
                                                </ul>
                                                <p>{post.content || post.description || post.excerpt || "No content available"}</p>
                                                {post.additional_content && (
                                                    <>
                                                        <blockquote>
                                                            <h2>{post.quote_title || "Featured Quote"}</h2>
                                                            <span className="designation">{post.quote_author || "Author"}</span>
                                                        </blockquote>
                                                        <p>{post.additional_content}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="post-share-option mb_60">
                                        <ul className="post-tags clearfix">
                                            <li><h4>Tags:</h4></li>
                                            {post.tags && typeof post.tags === 'string' ? (
                                                post.tags.split(',').map((tag: string, index: number) => (
                                                    <li key={index}><Link to="/website/blog">{tag.trim()}</Link></li>
                                                ))
                                            ) : (
                                                <>
                                                    <li><Link to="/website/blog">Medical</Link></li>
                                                    <li><Link to="/website/blog">Healthcare</Link></li>
                                                </>
                                            )}
                                        </ul>
                                        <ul className="post-share clearfix">
                                            <li><h4>Share:</h4></li>
                                            <li><Link to="/website/blog"><i className="fab fa-facebook-f"></i></Link></li>
                                            <li><Link to="/website/blog"><i className="fab fa-twitter"></i></Link></li>
                                            <li><Link to="/website/blog"><i className="fab fa-linkedin"></i></Link></li>
                                        </ul>
                                    </div>
                                    <div className="author-box mb_60">
                                        <figure className="author-thumb"><Image src={post.author_image || "/website/assets/images/news/author-1.jpg"} alt={post.author} width={172} height={172} priority /></figure>
                                        <h3>{post.author || "Author"}</h3>
                                        <p>{post.author_bio || "Professional healthcare expert with years of experience"}</p>
                                        <ul className="social-links clearfix">
                                            <li><Link to="/website/blog"><i className="fab fa-facebook-f"></i></Link></li>
                                            <li><Link to="/website/blog"><i className="fab fa-twitter"></i></Link></li>
                                            <li><Link to="/website/blog"><i className="fab fa-linkedin"></i></Link></li>
                                        </ul>
                                    </div>
                                    <div className="comment-box mb_60">
                                        <h3>Comments({post.comments?.length || 0})</h3>
                                        {post.comments && post.comments.length > 0 ? (
                                            post.comments.map((comment: any) => (
                                                <div key={comment.id} className="comment">
                                                    <figure className="thumb-box"><Image src="/website/assets/images/news/comment-1.jpg" alt="Commenter" width={88} height={86} priority /></figure>
                                                    <h4>{comment.name}<span>{new Date(comment.created_at).toLocaleDateString()}</span></h4>
                                                    <p>{comment.comment}</p>
                                                    <Link to="#" className="reply-btn" onClick={(e) => e.preventDefault()}><i className="icon-58"></i></Link>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No comments yet. Be the first to comment!</p>
                                        )}
                                    </div>
                                    <div className="comment-form">
                                        <h3>Leave a Reply</h3>
                                        {commentStatus.message && (
                                            <div className={`alert alert-${commentStatus.type}`} role="alert">
                                                {commentStatus.message}
                                            </div>
                                        )}
                                        <form onSubmit={handleCommentSubmit} className="default-form">
                                            <div className="row clearfix">
                                                <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                                                    <input 
                                                        type="text" 
                                                        name="name" 
                                                        placeholder="Name" 
                                                        required
                                                        value={commentData.name}
                                                        onChange={(e) => setCommentData({ ...commentData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                                                    <input 
                                                        type="email" 
                                                        name="email" 
                                                        placeholder="Email" 
                                                        required
                                                        value={commentData.email}
                                                        onChange={(e) => setCommentData({ ...commentData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                                                    <textarea 
                                                        name="message" 
                                                        placeholder="Type Comment Here ..."
                                                        required
                                                        value={commentData.message}
                                                        onChange={(e) => setCommentData({ ...commentData, message: e.target.value })}
                                                    ></textarea>
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
                                        <form method="post" action="/website/blog">
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
                                                <li><Link to="/website/blog">General Health</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget post-widget mb_40">
                                        <div className="widget-title">
                                            <h3>Latest News</h3>
                                        </div>
                                        <div className="post-inner">
                                            {latestPosts.map((latestPost: any) => (
                                                <div key={latestPost.id} className="post">
                                                    <figure className="post-thumb"><Link to={`/website/blog-details/${latestPost.id}`}><Image src={latestPost.featured_image || latestPost.image || "/website/assets/images/news/post-1.jpg"} alt={latestPost.title} width={100} height={101} priority /></Link></figure>
                                                    <h3><Link to={`/website/blog-details/${latestPost.id}`}>{latestPost.title}</Link></h3>
                                                    <ul className="post-info clearfix">
                                                        <li><i className="icon-59"></i>{latestPost.created_at || latestPost.published_at ? new Date(latestPost.created_at || latestPost.published_at).toLocaleDateString() : "Date"}</li>
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
    );
}
