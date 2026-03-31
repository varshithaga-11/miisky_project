import { useEffect, useState } from "react";
import Image from "../components/Image";
import { Link } from "react-router-dom";
import { useLayout } from "../context/LayoutContext";
import { getBlogPosts, getBlogCategories } from "../../utils/api";
import { MOCK_BLOG_POSTS } from "../utils/mockData";
import Cta from "../components/sections/home2/Cta";

export default function BlogPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [posts, setPosts] = useState(MOCK_BLOG_POSTS);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    useEffect(() => {
        setHeaderStyle(1);
        setBreadcrumbTitle("Blog Grid");
    }, [setHeaderStyle, setBreadcrumbTitle]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getBlogCategories();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setCategories(data);
            } catch (err) {
                console.warn('Failed to fetch blog categories:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const params: any = {};
                
                if (searchTerm) params.search = searchTerm;
                if (selectedCategory) params.category = selectedCategory;

                const response = await getBlogPosts(params);
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setPosts(data.length > 0 ? data : (searchTerm || selectedCategory ? [] : MOCK_BLOG_POSTS));
            } catch (err) {
                console.warn('Failed to fetch blog posts:', err);
                setPosts(searchTerm || selectedCategory ? [] : MOCK_BLOG_POSTS);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [searchTerm, selectedCategory]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        setSearchTerm(formData.get("search-field") as string || "");
    };

    const handleCategoryClick = (categoryId: number | null) => {
        setSelectedCategory(categoryId);
    };

    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

    return (
        <div className="boxed_wrapper text-left">
            <div className="bg-gray-100 py-4 border-b border-gray-200">
                <div className="auto-container flex justify-end">
                    <Link to="/website/blog-create" className="theme-btn btn-one !px-8 !py-2 text-sm"><span>Create Publication</span></Link>
                </div>
            </div>
            <section className="sidebar-page-container pt_80 pb_120">
                <div className="auto-container">
                    <div className="mb-10 pb-6 border-b border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-900 mb-0">Medical Insights</h2>
                    </div>
                    <div className="row clearfix">
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="blog-grid-content">
                                    <div className="row clearfix">
                                        {posts.map((post: any) => (
                                            <div key={post.id} className="col-lg-6 col-md-6 col-sm-12 news-block">
                                                <div className="news-block-one">
                                                    <div className="inner-box">
                                                        <figure className="image-box">
                                                            <Link to={`/website/blog-details/${post.id}`}>
                                                                <Image src={post.featured_image || post.image || "/website/assets/images/news/news-1.jpg"} alt={post.title} width={416} height={287} priority />
                                                            </Link>
                                                        </figure>
                                                        <div className="lower-content">
                                                            <span className="comment-box">{post.comment_count || 0} Comment</span>
                                                            <h3>
                                                                <Link to={`/website/blog-details/${post.id}`}>
                                                                    {post.title || "Untitled"}
                                                                </Link>
                                                            </h3>
                                                            <ul className="post-info clearfix">
                                                                <li><i className="icon-59"></i>{new Date(post.published_at || post.created_at || new Date()).toLocaleDateString()}</li>
                                                                <li><i className="icon-60"></i><Link to={`/website/blog-details/${post.id}`}>{post.author || "Admin"}</Link></li>
                                                            </ul>
                                                            <p>{post.excerpt || (post.content && post.content.substring(0, 100)) || "..."}</p>
                                                            <div className="link">
                                                                <Link to={`/website/blog-details/${post.id}`}>Read More</Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pagination-wrapper centred">
                                        <ul className="pagination clearfix">
                                            <li><Link to="/website/blog"><i className="icon-21"></i></Link></li>
                                            <li><Link to="/website/blog" className="current">01</Link></li>
                                            <li><Link to="/website/blog">02</Link></li>
                                            <li className="dotted"><Image src="/website/assets/images/icons/icon-21.svg" alt="Icon" width={23} height={5} priority /></li>
                                            <li><Link to="/website/blog"><i className="icon-22"></i></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                                <div className="blog-sidebar">
                                    <div className="search-widget mb_40">
                                        <h3>Search Here</h3>
                                        <form onSubmit={handleSearch}>
                                            <div className="form-group">
                                                <input type="search" name="search-field" placeholder="keywords" defaultValue={searchTerm}/>
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
                                                <li>
                                                    <Link to="#" onClick={(e) => { e.preventDefault(); handleCategoryClick(null); }} className={selectedCategory === null ? "active font-bold text-blue-600" : ""}>
                                                        All Categories
                                                    </Link>
                                                </li>
                                                {categories.map((cat: any) => (
                                                    <li key={cat.id}>
                                                        <Link to="#" onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.id); }} className={selectedCategory === cat.id ? "active font-bold text-blue-600" : ""}>
                                                            {cat.name}
                                                        </Link>
                                                    </li>
                                                ))}
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
                                                        <li><i className="icon-60"></i><Link to={`/website/blog-details/${latestPost.id}`}>{latestPost.author || "Admin"}</Link></li>
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
