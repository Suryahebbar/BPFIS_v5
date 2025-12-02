import Link from 'next/link';

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our marketplace, add products to your cart, and proceed to checkout. You'll need to provide shipping details and choose a payment method."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept cash on delivery (COD) and online payments through various payment gateways. Online payments are secure and encrypted."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery times vary by location and product. Typically, orders are delivered within 3-7 business days. You'll receive tracking information once your order ships."
    },
    {
      question: "Can I return or exchange products?",
      answer: "Yes, we offer a 7-day return policy for most products. Items must be unused and in original packaging. Some items like seeds may have different return policies."
    },
    {
      question: "How do I track my order?",
      answer: "You can track your order through the 'My Orders' section in your dashboard. We also send tracking updates via email and SMS."
    },
    {
      question: "Are the products genuine and quality assured?",
      answer: "Yes, all products are sourced from verified sellers and undergo quality checks. We work directly with manufacturers and authorized distributors."
    }
  ];

  const helpCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      items: [
        "Creating an account",
        "Browsing products",
        "Placing your first order",
        "Understanding product listings"
      ]
    },
    {
      title: "Orders & Shipping",
      icon: "📦",
      items: [
        "Order tracking",
        "Shipping information",
        "Delivery times",
        "Order modifications"
      ]
    },
    {
      title: "Payments & Refunds",
      icon: "💳",
      items: [
        "Payment methods",
        "Refund policy",
        "Billing issues",
        "Transaction security"
      ]
    },
    {
      title: "Account & Profile",
      icon: "👤",
      items: [
        "Account settings",
        "Profile management",
        "Password reset",
        "Privacy settings"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions, learn how to use our marketplace, and get support when you need it.
          </p>
        </div>

        {/* Quick Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-600 hover:text-[#1f3b2c] cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Search Help */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Search for Help</h2>
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your question or search for topics..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c]"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1f3b2c] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Get help via email within 24 hours</p>
              <a href="mailto:support@agrlink.com" className="text-[#1f3b2c] hover:underline">
                support@agrlink.com
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1f3b2c] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Mon-Fri, 9AM-6PM IST</p>
              <a href="tel:+918012345678" className="text-[#1f3b2c] hover:underline">
                +91 8012345678
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1f3b2c] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Get instant help from our team</p>
              <button className="text-[#1f3b2c] hover:underline font-medium">
                Start Chat
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link href="/marketplace" className="text-gray-600 hover:text-[#1f3b2c]">
              Browse Marketplace
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/marketplace/orders" className="text-gray-600 hover:text-[#1f3b2c]">
              Track Order
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/marketplace/cart" className="text-gray-600 hover:text-[#1f3b2c]">
              View Cart
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 AgriLink Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}