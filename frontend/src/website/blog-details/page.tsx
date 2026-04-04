import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import Cta from "../components/sections/home2/Cta";
import { FiHeart } from "react-icons/fi";
import { getBlogPostById, getBlogPosts, createBlogComment, getBlogCategories, getBlogTags, likeBlogPost, unlikeBlogPost } from "../../utils/api";
import { MOCK_BLOG_POSTS } from "../utils/mockData";

export default function BlogDetails() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<any>(null);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentData, setCommentData] = useState({ name: "", email: "", message: "" });
    const [commentStatus, setCommentStatus] = useState({ type: "", message: "" });
    const [replyTo, setReplyTo] = useState<any>(null);
    const [expandedComments, setExpandedComments] = useState<number[]>([]);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Blog Details");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (uid) {
                    const response = await getBlogPostById(uid);
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

        const fetchCategories = async () => {
            try {
                const response = await getBlogCategories();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setCategories(data);
            } catch (err) {
                console.warn('Failed to fetch blog categories:', err);
            }
        };
        
        const fetchTags = async () => {
            try {
                const response = await getBlogTags();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setTags(data);
            } catch (err) {
                console.warn('Failed to fetch blog tags:', err);
            }
        };
        
        const checkIfLiked = () => {
            if (uid) {
                const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
                setIsLiked(likedBlogs.includes(uid));
            }
        };

        fetchPost();
        fetchLatestPosts();
        fetchCategories();
        fetchTags();
        checkIfLiked();
    }, [uid]);

    useEffect(() => {
        if (post?.uid && String(uid) === String(post.id)) {
            navigate(`/blog-details/${post.uid}`, { replace: true });
        }
    }, [post, uid, navigate]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uid) return;
        
        setCommentStatus({ type: "info", message: "Submitting comment..." });
        try {
            await createBlogComment({
                blog_post: post.id,
                name: commentData.name,
                email: commentData.email,
                comment: commentData.message,
                parent: replyTo ? replyTo.id : null
            });
            setCommentStatus({ type: "success", message: "Your comment has been submitted successfully!" });
            setCommentData({ name: "", email: "", message: "" });
            setReplyTo(null);
            const response = await getBlogPostById(uid);
            setPost(response.data);
        } catch (err) {
            console.error("Failed to refresh post:", err);
            setCommentStatus({ type: "error", message: "Failed to submit comment." });
        }
    };

    const handleLike = async () => {
        if (!uid) return;
        
        try {
            if (isLiked) {
                // Unlike
                const response = await unlikeBlogPost(uid);
                setPost({ ...post, engagement: response.data.engagement });
                
                const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
                const newLikedBlogs = likedBlogs.filter((id: string) => id !== uid);
                localStorage.setItem("liked_blogs", JSON.stringify(newLikedBlogs));
                setIsLiked(false);
            } else {
                // Like
                const response = await likeBlogPost(uid);
                setPost({ ...post, engagement: response.data.engagement });
                
                const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
                likedBlogs.push(uid);
                localStorage.setItem("liked_blogs", JSON.stringify(likedBlogs));
                setIsLiked(true);
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
        }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
        }
        if (url.includes('vimeo.com')) {
            const regExp = /vimeo\.com\/(\d+)/;
            const match = url.match(regExp);
            return (match) ? `https://player.vimeo.com/video/${match[1]}` : null;
        }
        return url;
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
                                            <figure className="image-box">
                                                <Image src={post.featured_image || post.image || "/website/assets/images/news/news-7.jpg"} alt={post.title} width={856} height={425} priority />
                                            </figure>
                                            
                                            {/* Video Section */}
                                            {(post.video_url || post.video_file) && (
                                                <div className="video-content mt_30 mb_30" style={{ position: 'relative', overflow: 'hidden', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                                    {post.video_url ? (
                                                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                                            <iframe
                                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                                                src={getEmbedUrl(post.video_url) || ""}
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                                title={post.title}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <video 
                                                            controls 
                                                            className="w-100" 
                                                            style={{ width: '100%', maxHeight: '500px', display: 'block', backgroundColor: '#000' }}
                                                        >
                                                            <source src={post.video_file} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                </div>
                                            )}
                                            <div className="lower-content">
                                                <h3>{post.title || "Blog Post"}</h3>
                                                <ul className="post-info clearfix">
                                                    <li><i className="icon-59"></i>{post.created_at || post.published_at ? new Date(post.created_at || post.published_at).toLocaleDateString() : "Date"}</li>
                                                    <li><i className="icon-60"></i><Link to="">{post.author_name || post.author || "Admin"}</Link></li>
                                                    <li 
                                                        onClick={handleLike} 
                                                        style={{ cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center' }}
                                                        title={isLiked ? "Click to Unlike" : "Click to Like"}
                                                    >
                                                        <FiHeart className={isLiked ? 'text-danger' : ''} style={{ color: isLiked ? '#ff4d4d' : 'inherit', marginRight: '5px', strokeWidth: isLiked ? 3 : 2 }} />
                                                        <span style={{ fontWeight: 600, color: isLiked ? '#ff4d4d' : 'inherit' }}>
                                                            Like {post.engagement || 0}
                                                        </span>
                                                    </li>
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
                                            {post.tags && post.tags.length > 0 ? (
                                                post.tags.map((tag: any) => (
                                                    <li key={tag.id}><Link to={`/blog?tag=${tag.id}`}>{tag.name}</Link></li>
                                                ))
                                            ) : (
                                                <li><span>No tags</span></li>
                                            )}
                                        </ul>
                                    </div>
                                    {/* <div className="author-box mb_60">
                                        <figure className="author-thumb"><Image src={post.author_image || "/website/assets/images/news/author-1.jpg"} alt={post.author_name || post.author || "Author"} width={172} height={172} priority /></figure>
                                        <div className="author-info">
                                            <h3>{post.author_name || post.author || "Author"}</h3>
                                            {post.author_designation && (
                                                <span style={{ fontSize: '14px', color: '#0646ac', fontWeight: 600, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {post.author_designation}
                                                </span>
                                            )}
                                            <p>{post.author_bio || "Professional healthcare expert with years of experience"}</p>
                                        </div>
                                    </div> */}
                                    <div className="comment-box mb_60">
                                        <h3>Comments({post.comments?.length || 0})</h3>
                                        {post.comments && post.comments.length > 0 ? (
                                            post.comments.filter((c: any) => !c.parent).map((parentComment: any) => {
                                                const replies = post.comments.filter((c: any) => c.parent === parentComment.id);
                                                const isExpanded = expandedComments.includes(parentComment.id);

                                                return (
                                                    <div key={parentComment.id} className="comment-group">
                                                        {/* Parent Comment */}
                                                        <div className="comment" style={{ paddingLeft: '0px', marginBottom: '15px' }}>
                                                            <h4>{parentComment.name}<span>{new Date(parentComment.created_at).toLocaleDateString()}</span></h4>
                                                            <p>{parentComment.comment}</p>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
                                                                <Link 
                                                                    to="#comment-form" 
                                                                    style={{ fontSize: '13px', color: '#0646ac', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
                                                                    onClick={() => {
                                                                        setReplyTo(parentComment);
                                                                        document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
                                                                    }}
                                                                >
                                                                    <i className="icon-58"></i> Reply
                                                                </Link>
                                                                
                                                                {replies.length > 0 && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setExpandedComments(prev => 
                                                                                isExpanded ? prev.filter(id => id !== parentComment.id) : [...prev, parentComment.id]
                                                                            );
                                                                        }}
                                                                        style={{ fontSize: '13px', color: '#666', fontWeight: 600, border: 'none', background: 'none' }}
                                                                    >
                                                                        {isExpanded ? 'Hide Replies' : `View ${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Replies (Toggleable) */}
                                                        {isExpanded && replies.map((reply: any) => (
                                                            <div key={reply.id} className="comment" style={{ paddingLeft: '50px', marginBottom: '20px' }}>
                                                                <h4>{reply.name}<span>{new Date(reply.created_at).toLocaleDateString()}</span></h4>
                                                                <p>{reply.comment}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p>No comments yet. Be the first to comment!</p>
                                        )}
                                    </div>
                                    <div className="comment-form" id="comment-form">
                                        <h3>{replyTo ? `Replying to ${replyTo.name}` : 'Leave a Reply'}</h3>
                                        {replyTo && (
                                            <button 
                                                onClick={() => setReplyTo(null)}
                                                style={{ fontSize: '13px', color: '#ff4d4d', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                                            >
                                                ✕ Cancel Reply
                                            </button>
                                        )}
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
                                    <div className="sidebar-widget tags-widget mb_40">
                                        <div className="widget-title">
                                            <h3>Popular Tags</h3>
                                        </div>
                                        <div className="widget-content">
                                            <ul className="tags-list clearfix">
                                                {tags.length > 0 ? (
                                                    tags.map((tag: any) => (
                                                        <li key={tag.id}><Link to={`/blog?tag=${tag.id}`}>{tag.name}</Link></li>
                                                    ))
                                                ) : (
                                                    <>
                                                        <li><Link to="/blog">Medical</Link></li>
                                                        <li><Link to="/blog">Healthcare</Link></li>
                                                        <li><Link to="/blog">Health</Link></li>
                                                        <li><Link to="/blog">Research</Link></li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget category-widget mb_40">
                                        <div className="widget-title">
                                            <h3>Category</h3>
                                        </div>
                                        <div className="widget-content">
                                            <ul className="category-list clearfix">
                                                {categories.length > 0 ? (
                                                    categories.map((cat: any) => (
                                                        <li key={cat.id}>
                                                            <Link to={`/blog?category=${cat.id}`}>{cat.name}</Link>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <>
                                                        <li><Link to="/blog">Cardiology</Link></li>
                                                        <li><Link to="/blog">Dental</Link></li>
                                                        <li><Link to="/blog">Gastroenterology</Link></li>
                                                        <li><Link to="/blog">Neurology</Link></li>
                                                        <li><Link to="/blog">Orthopaedics</Link></li>
                                                        <li><Link to="/blog">General Health</Link></li>
                                                    </>
                                                )}
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
                                                    <figure className="post-thumb"><Link to={`/blog-details/${latestPost.uid || latestPost.id}`}><Image src={latestPost.featured_image || latestPost.image || "/website/assets/images/news/post-1.jpg"} alt={latestPost.title} width={100} height={101} priority /></Link></figure>
                                                    <h3><Link to={`/blog-details/${latestPost.uid || latestPost.id}`}>{latestPost.title}</Link></h3>
                                                    <ul className="post-info clearfix">
                                                        <li><i className="icon-59"></i>{latestPost.created_at || latestPost.published_at ? new Date(latestPost.created_at || latestPost.published_at).toLocaleDateString() : "Date"}</li>
                                                        <li><i className="icon-60"></i><Link to="/blog">{latestPost.author_name || latestPost.author || "Admin"}</Link></li>
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
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
