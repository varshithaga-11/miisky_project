import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Image from '@website/components/Image';
import { Link } from "react-router-dom";
import { useLayout } from '@website/context/LayoutContext';
import { getBlogPosts, getBlogCategories, getBlogTags } from '@/utils/api';
import { MOCK_BLOG_POSTS } from "../utils/mockData";
import Cta from '@website/components/sections/home2/Cta';

export default function BlogPage() {
    const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get("category");
    const tagParam = searchParams.get("tag");
    const [posts, setPosts] = useState(MOCK_BLOG_POSTS);
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        categoryParam ? parseInt(categoryParam) : null
    );
    const [selectedTag, setSelectedTag] = useState<number | null>(
        tagParam ? parseInt(tagParam) : null
    );

    useEffect(() => {
        setSelectedCategory(categoryParam ? parseInt(categoryParam) : null);
        setSelectedTag(tagParam ? parseInt(tagParam) : null);
    }, [categoryParam, tagParam]);

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
        const fetchTags = async () => {
            try {
                const response = await getBlogTags();
                const data = Array.isArray(response.data) ? response.data : response.data.results || [];
                setTags(data);
            } catch (err) {
                console.warn('Failed to fetch blog tags:', err);
            }
        };
        fetchCategories();
        fetchTags();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const params: any = {
                    page: currentPage,
                    limit: 6
                };
                
                if (searchTerm) params.search = searchTerm;
                if (selectedCategory) params.category = selectedCategory;
                if (selectedTag) params.tag = selectedTag;

                const response = await getBlogPosts(params);
                const isPaginated = !!response.data.results;
                const rawData = response.data.results || response.data;
                const total = response.data.count || (Array.isArray(rawData) ? rawData.length : 0);
                
                let displayPosts = Array.isArray(rawData) ? rawData : [];
                
                // Safety slice if backend fails to respect limit or returns unpaginated data
                if (!isPaginated || displayPosts.length > 6) {
                    const start = isPaginated ? 0 : (currentPage - 1) * 6;
                    displayPosts = displayPosts.slice(start, start + 6);
                }

                setPosts(displayPosts);
                setTotalPages(Math.ceil(total / 6) || 1);
                
                // If no data and we're not on page 1, go back
                if (Array.isArray(rawData) && rawData.length === 0 && currentPage > 1) {
                    setCurrentPage(1);
                }
            } catch (err) {
                console.warn('Failed to fetch blog posts:', err);
                setPosts(searchTerm || selectedCategory ? [] : MOCK_BLOG_POSTS);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [searchTerm, selectedCategory, selectedTag, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        setSearchTerm(formData.get("search-field") as string || "");
        setCurrentPage(1);
    };

    const handleCategoryClick = (categoryId: number | null) => {
        setSelectedCategory(categoryId);
        setSelectedTag(null);
        setCurrentPage(1);
    };

    const handleTagClick = (tagId: number | null) => {
        setSelectedTag(tagId);
        setSelectedCategory(null);
        setCurrentPage(1);
    };

    if (loading) return <div className="boxed_wrapper"><div style={{padding: '120px 0', textAlign: 'center'}}>Loading...</div></div>;

    return (
        <div className="boxed_wrapper text-left">
{/* <div className="bg-gray-100 py-4 border-b border-gray-200">
    <div className="auto-container flex justify-end">
        <Link to="/blog-create" className="theme-btn btn-one !px-8 !py-2 text-sm"><span>Create Publication</span></Link>
    </div>
</div> */}
            <section className="sidebar-page-container pt_80 pb_120">
                <div className="auto-container">
{/* <div className="mb-10 pb-6 border-b border-gray-100">
    <h2 className="text-3xl font-bold text-gray-900 mb-0">Medical Insights</h2>
</div> */}
                    <div className="row clearfix">
                            <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                                <div className="blog-grid-content">
                                    {(selectedCategory || selectedTag || searchTerm) && (
                                        <div className="mb_30 flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <div className="text-sm font-medium text-gray-600 italic">
                                                Showing blogs for: 
                                                <span className="ml-2 font-bold text-blue-600 not-italic">
                                                    {searchTerm && `Search: "${searchTerm}"`}
                                                    {selectedCategory && `Category: ${categories.find(c => c.id === selectedCategory)?.name || "..."}`}
                                                    {selectedTag && `Tag: #${tags.find(t => t.id === selectedTag)?.name || "..."}`}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedCategory(null); setSelectedTag(null); setSearchTerm(""); setCurrentPage(1); }}
                                                className="text-xs font-bold text-red-500 uppercase hover:text-red-700 transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    )}
                                    <div className="row clearfix">
                                        {posts.map((post: any) => (
                                            <div key={post.id} className="col-lg-6 col-md-6 col-sm-12 news-block">
                                                <div className="news-block-one">
                                                    <div className="inner-box">
                                                        <figure className="image-box">
                                                            <Link to={`/blog-details/${post.uid || post.id}`}>
                                                                <Image src={post.featured_image || post.image || "/website/assets/images/news/news-1.jpg"} alt={post.title} width={416} height={287} priority />
                                                            </Link>
                                                        </figure>
                                                        <div className="lower-content">
{/* <span className="comment-box">{post.comment_count || 0} Comment</span> */}
                                                            <h3>
                                                                <Link to={`/blog-details/${post.uid || post.id}`}>
                                                                    {post.title || "Untitled"}
                                                                </Link>
                                                            </h3>
                                                            <ul className="post-info clearfix">
                                                                <li><i className="icon-59"></i>{new Date(post.published_at || post.created_at || new Date()).toLocaleDateString()}</li>
                                                                <li><i className="icon-60"></i><Link to={`/blog-details/${post.uid || post.id}`}>{post.author_name || post.author || "Admin"}</Link></li>
                                                            </ul>
                                                            <p>{post.excerpt || (post.content && post.content.substring(0, 100)) || "..."}</p>
                                                            <div className="link">
                                                                <Link to={`/blog-details/${post.uid || post.id}`}>Read More</Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="pagination-wrapper centred">
                                            <ul className="pagination clearfix">
                                                <li>
                                                    <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
                                                        <i className="icon-21"></i>
                                                    </Link>
                                                </li>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <li key={i+1}>
                                                        <Link to="#" className={currentPage === i + 1 ? "current" : ""} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                                                            {(i + 1).toString().padStart(2, '0')}
                                                        </Link>
                                                    </li>
                                                ))}
                                                <li>
                                                    <Link to="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
                                                        <i className="icon-22"></i>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
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
                                                {tags.map((tag: any) => (
                                                    <li key={tag.id}>
                                                        <Link 
                                                            to="#" 
                                                            onClick={(e) => { e.preventDefault(); handleTagClick(tag.id); }}
                                                            className={selectedTag === tag.id ? "active font-bold text-blue-600" : ""}
                                                        >
                                                            {tag.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
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
                                                    <figure className="post-thumb"><Link to={`/blog-details/${latestPost.id}`}><Image src={latestPost.featured_image || latestPost.image || "/website/assets/images/news/post-1.jpg"} alt={latestPost.title} width={100} height={101} priority /></Link></figure>
                                                    <h3><Link to={`/blog-details/${latestPost.id}`}>{latestPost.title}</Link></h3>
                                                    <ul className="post-info clearfix">
                                                        <li><i className="icon-59"></i>{new Date(latestPost.published_at || latestPost.created_at || new Date()).toLocaleDateString()}</li>
                                                        <li><i className="icon-60"></i><Link to={`/blog-details/${latestPost.id}`}>{latestPost.author_name || latestPost.author || "Admin"}</Link></li>
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
