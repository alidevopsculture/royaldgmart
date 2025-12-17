export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Disclaimer
          </h1>
          <p className="text-xl text-gray-600">
            Royal Digital Mart, India
          </p>
        </div>

        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              The information contained in this website is for general information purposes only. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
            </p>

            <div className="bg-red-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                General Information
              </h2>
              <p className="text-gray-700">
                Any reliance you place on such information is therefore strictly at your own risk. In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Product Information
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>Product colors may vary slightly due to photographic lighting sources or monitor settings.</li>
                <li>We strive to display accurate product information, but cannot guarantee that all details are error-free.</li>
                <li>Actual product specifications may vary from those shown on the website.</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                External Links
              </h2>
              <p className="text-gray-700">
                Through this website you may be able to link to other websites which are not under the control of Royal Digital Mart. We have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                Availability & Pricing
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>All products are subject to availability and may be discontinued without notice.</li>
                <li>Prices are subject to change without prior notice.</li>
                <li>We reserve the right to refuse or cancel orders at our discretion.</li>
              </ul>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                Limitation of Liability
              </h2>
              <p className="text-gray-700">
                Royal Digital Mart shall not be liable for any direct, indirect, incidental, special, consequential or punitive damages arising out of your use of, or inability to use, the website or any products purchased through the website.
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                Contact Information
              </h2>
              <p className="text-gray-700 mb-4">If you have any questions about this disclaimer, please contact us:</p>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📧</span>
                <div>
                  <strong>Email:</strong> <a href="mailto:royaldigitalmart@gmail.com" className="text-blue-600 hover:underline">royaldigitalmart@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
