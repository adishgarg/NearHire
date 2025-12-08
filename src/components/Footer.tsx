import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export function Footer() {
  const footerLinks = {
    categories: [
      'Graphics & Design',
      'Programming & Tech',
      'Video & Animation',
      'Writing & Translation',
      'Digital Marketing',
    ],
    about: [
      'About Us',
      'Careers',
      'Press & News',
      'Partnerships',
      'Privacy Policy',
    ],
    support: [
      'Help & Support',
      'Trust & Safety',
      'Selling on NearHire',
      'Buying on NearHire',
      'Contact Us',
    ],
    community: [
      'Events',
      'Blog',
      'Forum',
      'Podcast',
      'Affiliates',
    ],
  };

  return (
    <footer className="border-t border-gray-200 bg-[#f5ecdf]">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Categories */}
          <div>
            <h4 className="mb-6 text-gray-900 font-serif font-semibold">Categories</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-6 text-gray-900 font-serif font-semibold">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-6 text-gray-900 font-serif font-semibold">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-6 text-gray-900 font-serif font-semibold">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-6 text-gray-900 font-serif font-semibold">Stay Connected</h4>
            <p className="mb-4 text-gray-600 text-sm">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 rounded-full">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 rounded-full">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 rounded-full">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 rounded-full">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-gray-300" />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-serif text-xl font-semibold">NearHire</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 NearHire. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
