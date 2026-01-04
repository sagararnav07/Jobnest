import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Blog = () => {
    const featuredPost = {
        title: 'The Future of Remote Work: Trends to Watch in 2025',
        excerpt: 'As remote work continues to evolve, new technologies and practices are shaping how we collaborate. Here\'s what to expect...',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
        category: 'Industry Trends',
        date: 'Nov 28, 2025',
        readTime: '8 min read'
    }

    const posts = [
        {
            title: '10 Resume Tips That Actually Get You Hired',
            excerpt: 'Stand out from the crowd with these proven resume strategies that hiring managers love.',
            image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop',
            category: 'Career Tips',
            date: 'Nov 25, 2025',
            readTime: '5 min read'
        },
        {
            title: 'How AI is Transforming the Hiring Process',
            excerpt: 'From resume screening to interview scheduling, AI is changing recruitment. Here\'s how to adapt.',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
            category: 'Technology',
            date: 'Nov 22, 2025',
            readTime: '6 min read'
        },
        {
            title: 'Mastering the Virtual Interview',
            excerpt: 'Tips and tricks for nailing your next video interview and making a great impression.',
            image: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=400&h=250&fit=crop',
            category: 'Interview Tips',
            date: 'Nov 20, 2025',
            readTime: '4 min read'
        },
        {
            title: 'Salary Negotiation: Getting What You Deserve',
            excerpt: 'Learn the art of negotiating your salary with confidence and securing better compensation.',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
            category: 'Career Tips',
            date: 'Nov 18, 2025',
            readTime: '7 min read'
        },
        {
            title: 'Building Your Personal Brand on LinkedIn',
            excerpt: 'Strategies for creating a LinkedIn profile that attracts recruiters and opportunities.',
            image: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=400&h=250&fit=crop',
            category: 'Networking',
            date: 'Nov 15, 2025',
            readTime: '5 min read'
        },
        {
            title: 'Top Tech Skills in Demand for 2025',
            excerpt: 'The most sought-after technical skills that employers are looking for right now.',
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
            category: 'Industry Trends',
            date: 'Nov 12, 2025',
            readTime: '6 min read'
        }
    ]

    const categories = ['All', 'Career Tips', 'Interview Tips', 'Industry Trends', 'Technology', 'Networking']

    return (
        <div className="padding-10 min-h-screen bg-base-100">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-24">
                <div className="padding-10 max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">JobNest Blog</h1>
                        <p className="text-xl opacity-90">
                            Career advice, industry insights, and tips to help you succeed
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="py-20">
                <div className="padding-10 max-w-6xl mx-auto px-6">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-4 justify-center mb-14">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`btn btn-sm ${category === 'All' ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Featured Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card lg:card-side bg-base-100 shadow-xl mb-14 p-4"
                    >
                        <figure className="lg:w-1/2">
                            <img
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="h-64 lg:h-full w-full object-cover"
                            />
                        </figure>
                        <div className="card-body lg:w-1/2 px-2 py-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-primary">{featuredPost.category}</span>
                                <span className="text-sm text-base-content/60">Featured</span>
                            </div>
                            <h2 className="card-title text-2xl">{featuredPost.title}</h2>
                            <p className="text-base-content/70">{featuredPost.excerpt}</p>
                            <div className="flex items-center gap-4 text-sm text-base-content/60 mt-4">
                                <span>{featuredPost.date}</span>
                                <span>•</span>
                                <span>{featuredPost.readTime}</span>
                            </div>
                            <div className="card-actions mt-4">
                                <button className="btn btn-primary">Read More</button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Posts Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer p-4"
                            >
                                <figure>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="h-48 w-full object-cover"
                                    />
                                </figure>
                                <div className="card-body px-2 py-4">
                                    <span className="badge badge-ghost badge-sm">{post.category}</span>
                                    <h3 className="card-title text-lg">{post.title}</h3>
                                    <p className="text-sm text-base-content/70">{post.excerpt}</p>
                                    <div className="flex items-center gap-4 text-xs text-base-content/60 mt-2">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="text-center mt-16">
                        <button className="btn btn-outline btn-primary">Load More Articles</button>
                    </div>
                </div>
            </div>

            {/* Newsletter CTA */}
            <div className="py-20 bg-base-200">
                <div className="padding-10 max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                    <p className="text-base-content/70 mb-6">
                        Get the latest career tips and industry insights delivered to your inbox weekly.
                    </p>
                    <div className="join w-full max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="input input-bordered join-item flex-1"
                        />
                        <button className="btn btn-primary join-item">Subscribe</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Blog
