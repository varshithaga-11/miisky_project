import Image from "../../Image";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBlogPosts } from "../../../../utils/api";
import { MOCK_BLOG_POSTS } from "@/website/utils/mockData";

export default function News() {
  const [blogPosts, setBlogPosts] = useState<any[]>(MOCK_BLOG_POSTS.slice(0, 3));

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await getBlogPosts();
        const data = response.data;
        const blogData = Array.isArray(data) ? data : data.results || data;
        if (blogData && blogData.length > 0) {
          setBlogPosts(blogData.slice(0, 3));
        }
      } catch (err) {
        console.warn("Failed to fetch blog posts for home3, using mock data:", err);
      }
    };
    fetchBlogPosts();
  }, []);

  return (
    <section className="news-section sec-pad">
      <div className="auto-container">
        <div className="sec-title centred mb_60">
          <span className="sub-title mb_5">Latest News</span>
          <h2>
            Resources to Keep You Informed <br /> with Our Blog
          </h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and
            preventive care for various <br />
            illnesses, injuries, and diseases.
          </p>
        </div>

        <div className="row clearfix">
          {blogPosts.map((post) => (
            <div key={post.id} className="col-lg-4 col-md-6 col-sm-12 news-block">
              <div className="news-block-one">
                <div className="inner-box">
                  <figure className="image-box">
                    <Link to={`/website/blog-details/${post.id}`}>
                      <Image
                        src={post.featured_image || post.image || "/website/assets/images/news/news-1.jpg"}
                        alt={post.title}
                        width={416}
                        height={287}
                      />
                    </Link>
                  </figure>
                  <div className="lower-content">
                    <span className="comment-box">{post.comment_count || 0} Comments</span>
                    <h3>
                      <Link to={`/website/blog-details/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <ul className="post-info clearfix">
                      <li>
                        <i className="icon-59"></i>{new Date(post.published_at || post.created_at || new Date()).toLocaleDateString()}
                      </li>
                      <li>
                        <i className="icon-60"></i>
                        <Link to={`/website/blog-details/${post.id}`}>{post.author_name || post.author || "Admin"}</Link>
                      </li>
                    </ul>
                    <p>
                      {post.excerpt || (post.content ? post.content.substring(0, 100) + "..." : "No description available.")}
                    </p>
                    <div className="link">
                      <Link to={`/website/blog-details/${post.id}`}>Read More</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
