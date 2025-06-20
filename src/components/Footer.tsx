
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/90 border-t border-gray-200 shadow-inner backdrop-blur-sm py-8 mt-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          {/* Legal */}
          <div className="flex-1 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal</h3>
            <ul>
              <li>
                <Link to="/privacy" className="hover:text-google-blue transition-colors duration-300 underline underline-offset-4">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          {/* Social */}
          <div className="flex-1 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Social</h3>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/Atul_Waman_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-full bg-google-blue/10 p-2 hover:bg-google-blue/20 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6 text-google-blue" />
              </a>
              <a 
                href="https://github.com/AtulC137" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-full bg-gray-800/10 p-2 hover:bg-gray-800/20 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 text-gray-900" />
              </a>
            </div>
          </div>
          {/* Contact */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
            <a
              href="mailto:wamanatul@gmail.com"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-google-green transition-colors"
            >
              <Mail className="w-5 h-5" />
              wamanatul@gmail.com
            </a>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SaveBits. Built with ❤️ by Atul Waman.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

