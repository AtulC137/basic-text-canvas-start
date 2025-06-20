
import React from 'react';
import { LandingHeader } from '@/components/LandingHeader';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50">
      <LandingHeader />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Privacy Policy</h1>
          <div className="space-y-6 text-gray-600">
            <p>
              Your privacy and data security are our top priorities. This policy outlines how we handle your information when you use SaveBits.
            </p>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Information We Collect</h2>
              <p>
                When you connect your Google Account, we request permission to access your Google Drive files. We only access files you explicitly choose to compress or manage through our service. We collect:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                <li>
                  <strong>User Information:</strong> Your name, email address, and profile picture from your Google account to personalize your experience.
                </li>
                <li>
                  <strong>File Metadata:</strong> Information about your files, such as file names, types, sizes, and modification dates, to help you identify and manage them.
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">How We Use Your Information</h2>
              <p>
                We use the information we collect solely to provide and improve our services. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                <li>
                  <strong>File Compression:</strong> We access file content only during the compression process. Files are processed in-memory and are not stored on our servers permanently.
                </li>
                <li>
                  <strong>Service Operation:</strong> Your account information and file metadata are used to display your files, track your storage savings, and manage your compressed files within your SaveBits dashboard.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                <li>
                  <strong>Secure Authentication:</strong> We use OAuth 2.0 for secure, password-less authentication with your Google Account. We never see or store your Google password.
                </li>
                <li>
                  <strong>Data Encryption:</strong> All data transmitted between your browser, our servers, and Google's servers is encrypted using TLS (Transport Layer Security).
                </li>
                <li>
                  <strong>No Permanent Storage:</strong> We do not store your original or compressed files on our servers. All file operations happen directly with your Google Drive.
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Third-Party Access</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personally identifiable information or your files to outside parties. All operations are contained within the SaveBits service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your Consent</h2>
              <p>
                By using our site, you consent to our web site privacy policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Changes to our Privacy Policy</h2>
              <p>
                If we decide to change our privacy policy, we will post those changes on this page. This policy was last modified on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Contacting Us</h2>
              <p>
                If there are any questions regarding this privacy policy, you may contact us.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

