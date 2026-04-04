import Image from "../../Image";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useState } from "react";
import { getBlogPosts } from "../../../../utils/api";
import type { BlogPost } from '../../../../Website/utils/types';
import { MOCK_BLOG_POSTS } from '../../../../Website/utils/mockData';

interface NewsProps {
  posts?: BlogPost[];
}

export default function News({ posts }: NewsProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(posts || MOCK_BLOG_POSTS);
  const [, setLoading] = useState(!posts);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (posts) {
      setBlogPosts(posts);
      setLoading(false);
      return;
    }

    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await getBlogPosts();
        const data = response.data;

        // Handle both array and paginated responses
        const blogData = Array.isArray(data) ? data : data.results || data;
        const formattedPosts = blogData.map((post: any) => ({
          id: post.id,
          uid: post.uid,
          title: post.title || "Untitled",
          slug: post.slug || `post-${post.uid || post.id}`,
          excerpt: post.excerpt || post.content?.substring(0, 150) || "",
          image: post.image || post.featured_image_url || post.featured_image || "/website/assets/images/news/news-1.jpg",
          author: post.author_name || post.author?.name || post.author || "Admin",
          category: post.category_name || post.category?.name || (typeof post.category === 'string' ? post.category : null),
          published_at: post.published_at || new Date().toISOString(),
        }));

        setBlogPosts(formattedPosts.length > 0 ? formattedPosts : MOCK_BLOG_POSTS);
        setError(null);
      } catch (err) {
        console.warn("Failed to fetch blog posts, using mock data:", err);
        setBlogPosts(MOCK_BLOG_POSTS);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [posts]);

  return (
    <section className="news-section sec-pad">
      <div className="auto-container">
        <div className="sec-title centred mb_60 relative">
          <span className="sub-title mb_5">Latest News</span>
          <h2>Resources to Keep You Informed <br />with Our Blog</h2>
          <p className="mt_20 mb_30">
            Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />
            illnesses, injuries, and diseases.
          </p>

        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
          breakpoints={{
            320:  { slidesPerView: 1 },
            575:  { slidesPerView: 1 },
            767:  { slidesPerView: 2 },
            991:  { slidesPerView: 2 },
            1199: { slidesPerView: 3 },
          }}
        >
          {blogPosts.map((post) => (
            <SwiperSlide key={post.id}>
              <div className="news-block-one">
                <div className="inner-box">
                  <figure className="image-box">
                    <Link to={`/blog-details/${post.uid || post.id}`}>
                      <Image
                        src={post.image || '/website/assets/images/news/news-1.jpg'}
                        alt={post.title}
                        width={400}
                        height={300}
                      />
                    </Link>
                  </figure>
                  <div className="lower-content">
                    {/* {post.category && (
                      <span className="comment-box">{post.category}</span>
                    )} */}
                    <h3>
                      <Link to={`/blog-details/${post.id}`}>{post.title}</Link>
                    </h3>
                    <ul className="post-info clearfix">
                      <li>
                        <i className="icon-59"></i>
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </li>
                      <li>
                        <i className="icon-60"></i>
                        <Link to={`/blog-details/${post.uid || post.id}`}>
                          {post.author || "Admin"}
                        </Link>
                      </li>
                    </ul>
                    <p>{post.excerpt}</p>
                    <div className="link">
                      <Link to={`/blog-details/${post.id}`}>Read More</Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          <div className="nav-style-one">
            <div className="swiper-nav">
              <button type="button" className="swiper-prev"><span className="icon-21"></span></button>
              <button type="button" className="swiper-next"><span className="icon-22"></span></button>
            </div>
          </div>
        </Swiper>
      </div>
    </section>
  );
}
