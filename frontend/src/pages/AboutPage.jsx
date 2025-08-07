import React from 'react';
import { Leaf, Users, Target, Heart, Award, MapPin, Phone, Mail, Star, CheckCircle } from 'lucide-react';
import Navigation from '../components/navigation';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616c6106db3?w=400&h=400&fit=crop",
      bio: "With 15+ years in sustainable agriculture, Sarah founded FarmNex to bridge the gap between farmers and consumers.",
      expertise: "Agricultural Innovation, Business Strategy"
    },
    {
      name: "Michael Chen",
      role: "Head of Technology",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      bio: "Tech enthusiast who believes in using technology to create sustainable food systems for the future.",
      expertise: "Software Development, AI & Data Analytics"
    },
    {
      name: "Emma Rodriguez",
      role: "Director of Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "Operations expert ensuring smooth delivery of fresh produce from farm to your doorstep.",
      expertise: "Supply Chain, Logistics Management"
    },
    {
      name: "David Thompson",
      role: "Sustainability Advisor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "Environmental scientist committed to promoting sustainable farming practices and organic agriculture.",
      expertise: "Environmental Science, Organic Certification"
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "Company Founded",
      description: "Started with a vision to connect local farmers directly with consumers"
    },
    {
      year: "2020",
      title: "First 100 Farmers",
      description: "Partnered with our first 100 local organic farmers across the region"
    },
    {
      year: "2021",
      title: "Mobile App Launch",
      description: "Launched our mobile platform making organic shopping even easier"
    },
    {
      year: "2022",
      title: "10,000 Customers",
      description: "Reached 10,000 satisfied customers and expanded to 5 states"
    },
    {
      year: "2023",
      title: "Sustainability Award",
      description: "Recognized as 'Best Sustainable Food Platform' by Green Business Awards"
    },
    {
      year: "2024",
      title: "Training Program",
      description: "Launched comprehensive training platform for farmers and consumers"
    }
  ];

  const values = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Sustainability First",
      description: "We prioritize environmental responsibility in everything we do, from farming practices to packaging."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Community Focus",
      description: "Building stronger communities by connecting local farmers with their neighbors."
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Quality Assurance",
      description: "Every product meets our strict quality standards for freshness, taste, and nutritional value."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Fair Trade",
      description: "Ensuring fair compensation for farmers while providing affordable prices for consumers."
    }
  ];

  const stats = [
    { number: "500+", label: "Partner Farmers" },
    { number: "50,000+", label: "Happy Customers" },
    { number: "1M+", label: "Orders Delivered" },
    { number: "12", label: "States Served" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navigation />

      <div className="pt-10">
        {/* Hero Section */}
        <section 
          className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                About <span className="text-green-400">FarmNex</span>
              </h1>
              <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
                We're revolutionizing agriculture by connecting farmers directly with consumers, 
                promoting sustainable farming, and building stronger communities through fresh, organic produce.
              </p>
              <div className="flex justify-center space-x-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">{stat.number}</div>
                    <div className="text-white text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  To create a sustainable food ecosystem that empowers farmers, educates consumers, 
                  and promotes healthy living through access to fresh, organic produce while 
                  supporting local communities and environmental stewardship.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Our Vision</h3>
                    <p className="text-gray-600">A world where sustainable farming is the norm, not the exception.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop" 
                  alt="Sustainable farming"
                  className="rounded-lg shadow-lg w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section 
          className="py-16 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.95), rgba(249, 250, 251, 0.95)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do, from how we work with farmers 
                to how we serve our customers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-green-600">{value.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{value.title}</h3>
                  <p className="text-gray-600 text-center">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our diverse team brings together expertise in agriculture, technology, 
                and sustainability to create the best experience for farmers and consumers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="relative overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-64 object-cover transition-transform hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-lg">{member.name}</h3>
                      <p className="text-sm">{member.role}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-3 text-sm">{member.bio}</p>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-green-600 font-medium">EXPERTISE</p>
                      <p className="text-sm text-gray-700">{member.expertise}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline/Milestones Section */}
        <section 
          className="py-16 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.05), rgba(21, 128, 61, 0.05)), url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From a small startup to a leading agricultural platform, here are the key milestones that shaped our story.
              </p>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-200 hidden lg:block"></div>
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                            {milestone.year.slice(-2)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{milestone.title}</h3>
                            <p className="text-green-600 font-medium">{milestone.year}</p>
                          </div>
                        </div>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="hidden lg:block lg:w-1/2"></div>
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow-lg hidden lg:block"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Location Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Have questions about our platform, want to partner with us, or just want to say hello? 
                We'd love to hear from you!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Us</h3>
                <p className="text-gray-600">
                  123 Farm Street<br />
                  Green Valley, CA 90210<br />
                  United States
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600">
                  Customer Service:<br />
                  <a href="tel:+15551234567" className="text-green-600 hover:text-green-700">(555) 123-4567</a><br />
                  Mon-Fri: 8AM-6PM PST
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600">
                  General: <a href="mailto:info@farmnex.com" className="text-green-600 hover:text-green-700">info@farmnex.com</a><br />
                  Support: <a href="mailto:support@farmnex.com" className="text-green-600 hover:text-green-700">support@farmnex.com</a><br />
                  Partners: <a href="mailto:partners@farmnex.com" className="text-green-600 hover:text-green-700">partners@farmnex.com</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-16 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9)), url('https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Join the FarmNex Community</h2>
            <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
              Whether you're a farmer looking to reach more customers or a consumer seeking fresh, 
              organic produce, we're here to help you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                Start Shopping
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105 backdrop-blur-sm">
                Become a Partner
              </button>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
