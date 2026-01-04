import { useState } from 'react'
import { motion } from 'framer-motion'

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // In production, this would send to a backend
        console.log('Contact form submitted:', formData)
        setSubmitted(true)
    }

    const contactInfo = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Email',
            value: 'support@jobnest.com',
            link: 'mailto:support@jobnest.com'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: 'Phone',
            value: '+1 (555) 123-4567',
            link: 'tel:+15551234567'
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: 'Address',
            value: '123 Innovation Drive, San Francisco, CA 94105',
            link: 'https://maps.google.com'
        }
    ]

    const departments = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Technical Support' },
        { value: 'sales', label: 'Sales & Partnerships' },
        { value: 'press', label: 'Press & Media' },
        { value: 'careers', label: 'Careers at JobNest' }
    ]

    return (
        <div className="padding-10 min-h-screen bg-base-100">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-24">
                <div className="padding-10 max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            Have questions? We'd love to hear from you. Send us a message 
                            and we'll respond as soon as possible.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="py-20">
                <div className="padding-10 max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-3 gap-16">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                                <p className="text-base-content/70 mb-8">
                                    Whether you're a job seeker looking for your next opportunity 
                                    or an employer searching for top talent, we're here to help.
                                </p>
                            </div>

                            {contactInfo.map((item, index) => (
                                <motion.a
                                    key={item.title}
                                    href={item.link}
                                    target={item.title === 'Address' ? '_blank' : undefined}
                                    rel={item.title === 'Address' ? 'noopener noreferrer' : undefined}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-6 p-5 rounded-xl bg-base-200 hover:bg-base-300 transition-colors shadow"
                                >
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-base-content/70">{item.value}</p>
                                    </div>
                                </motion.a>
                            ))}

                            {/* Office Hours */}
                            <div className="p-5 rounded-xl bg-base-200 shadow">
                                <h3 className="font-semibold mb-2">Office Hours</h3>
                                <div className="text-sm text-base-content/70 space-y-1">
                                    <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                                    <p>Saturday: 10:00 AM - 4:00 PM PST</p>
                                    <p>Sunday: Closed</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card bg-base-100 shadow-xl p-2"
                            >
                                <div className="card-body p-10">
                                    {submitted ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                            <p className="text-base-content/70 mb-6">
                                                Thank you for reaching out. We'll get back to you within 24 hours.
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    setSubmitted(false)
                                                    setFormData({ name: '', email: '', subject: '', message: '' })
                                                }}
                                                className="btn btn-primary"
                                            >
                                                Send Another Message
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">Your Name</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="input input-bordered"
                                                        placeholder="John Doe"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">Email Address</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="input input-bordered"
                                                        placeholder="john@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-medium">Department</span>
                                                </label>
                                                <select
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="select select-bordered"
                                                    required
                                                >
                                                    <option value="">Select a department</option>
                                                    {departments.map(dept => (
                                                        <option key={dept.value} value={dept.value}>
                                                            {dept.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-medium">Message</span>
                                                </label>
                                                <textarea
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    className="textarea textarea-bordered h-32"
                                                    placeholder="How can we help you?"
                                                    required
                                                />
                                            </div>

                                            <button type="submit" className="btn btn-primary btn-block">
                                                Send Message
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact
