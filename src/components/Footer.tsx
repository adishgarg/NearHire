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
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Categories */}
          <div>
            <h3 className="mb-4 text-white">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-4 text-white">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-4 text-white">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-white">Stay Connected</h3>
            <p className="mb-4 text-gray-400">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-zinc-800" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <span className="text-white">N</span>
            </div>
            <span className="text-white">NearHire</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 NearHire. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
