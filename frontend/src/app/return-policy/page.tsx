export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Returns & Exchange Policy
          </h1>
          <p className="text-xl text-gray-600">
            Royal Digital Mart, India
          </p>
        </div>

        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Welcome to Royal Digital Mart! We take pride in offering premium products at competitive prices, ensuring quality and reliability. Customer satisfaction is our top priority, but we understand that sometimes a return or exchange may be necessary. Please review our policy below to understand the process clearly.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                General Guidelines
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>This return and exchange policy is applicable only for eligible products purchased directly from Royal Digital Mart's website.</li>
                <li>Customized, personalized, or special-order products are not eligible for return or exchange.</li>
                <li>Items must be returned in their original, unused, unwashed, and undamaged condition with all original tags, packaging, and invoice.</li>
                <li>Any request for return or exchange must be raised within <strong>7 days of delivery</strong>.</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Non-Returnable Items
              </h2>
              <p className="text-gray-700 mb-4">The following items cannot be returned or exchanged:</p>
              <ul className="space-y-3 text-gray-700">
                <li>Customized or made-to-order products.</li>
                <li>Products purchased on sale, clearance, or discount offers.</li>
                <li>Accessories (such as electronic accessories, chargers, cables, etc.), due to hygiene and usage concerns.</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                Return and Exchange Eligibility
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>Only products that are ready-to-ship and delivered in defective or incorrect condition are eligible for return/exchange.</li>
                <li>Returns will not be accepted if the product shows signs of use, alteration, or damage after delivery.</li>
                <li>Please note that slight variations in product color or finish may occur due to lighting, photography, or screen display settings. Such variations will not be considered as defects.</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                Return Process
              </h2>
              <p className="text-gray-700 mb-4">If you wish to return an eligible item, please follow these steps:</p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-1">1</span>
                  <div>
                    <strong>Request Approval:</strong> Email us at <a href="mailto:support@royaldigitalmart.com" className="text-blue-600 hover:underline">support@royaldigitalmart.com</a> within 7 days of receiving your order. Include your order number, product details, and reason for return.
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-1">2</span>
                  <div>
                    <strong>Return Shipping:</strong> Once approved, the product must be shipped back within 5 days. Return shipping costs are the responsibility of the customer unless the item received is defective or incorrect.
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-1">3</span>
                  <div>
                    <strong>Inspection & Refund:</strong> Once we receive and inspect the returned item, a refund will be initiated to your original payment method within 7-10 business days (only for eligible items).
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                Exchange Policy
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>Exchanges are only applicable for eligible, non-customized products.</li>
                <li>If the requested replacement is unavailable, we will issue a refund or store credit as per your preference.</li>
              </ul>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                Defective or Incorrect Items
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>If you receive a defective, damaged, or incorrect product, please notify us within 3 days of delivery at <a href="mailto:support@royaldigitalmart.com" className="text-blue-600 hover:underline">support@royaldigitalmart.com</a> with photos and order details.</li>
                <li>After verification, we will provide a replacement, refund, or store credit at no additional cost to you.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">11</span>
                Contact Information
              </h2>
              <p className="text-gray-700 mb-4">For queries or assistance regarding returns, exchanges, or refunds, please contact us:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📧</span>
                  <div>
                    <strong>Email:</strong> <a href="mailto:support@royaldigitalmart.com" className="text-blue-600 hover:underline">support@royaldigitalmart.com</a>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏢</span>
                  <div>
                    <strong>Address:</strong> Royal Digital Mart, India
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">12</span>
                Policy Updates
              </h2>
              <p className="text-gray-700">
                Royal Digital Mart reserves the right to update or modify this return and exchange policy at any time without prior notice. Customers are encouraged to review this policy periodically. Continued use of our website or services constitutes acceptance of these changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}