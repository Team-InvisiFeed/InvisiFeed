"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Github,
} from "lucide-react";
import SocialMediaPopup from "./SocialMediaPopup";

function Footer() {
  const [isSocialMediaPopupOpen, setIsSocialMediaPopupOpen] = useState(false);
  const [selectedSocialMedia, setSelectedSocialMedia] = useState(null);
  const socialLinks = [
    {
      name: "github",
      icon: Github,
      onClick: () => {
        setSelectedSocialMedia("github");
        setIsSocialMediaPopupOpen(true);
      },
    },
    {
      name: "twitter",
      icon: Twitter,
      onClick: () => {
        setSelectedSocialMedia("twitter");
        setIsSocialMediaPopupOpen(true);
      },
    },
    {
      name: "linkedin",
      icon: Linkedin,
      onClick: () => {
        setSelectedSocialMedia("linkedin");
        setIsSocialMediaPopupOpen(true);
      },
    },
  ];

  return (
    <footer className="bg-[#0A0A0A] text-gray-300" id="contact">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <a
              href="#"
              className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent"
            >
              InvisiFeed
            </a>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting people with invisible threads of care and connection.
              Empowering organizations with honest, anonymous feedback.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-yellow-400">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Home", "About Us", "Contact Us", "Privacy Policy"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>{link}</span>
                    </a>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-yellow-400">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-colors">
                <Mail className="h-4 w-4" />
                <span>support@invisifeed.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-colors">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-colors">
                <MapPin className="h-4 w-4" />
                <span>123 Business Ave, Suite 100</span>
              </li>
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-yellow-400">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  onClick={social.onClick}
                  className="p-2 bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-[#0A0A0A]/70 transition-all duration-200 border border-yellow-400/10"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-yellow-400/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2025 InvisiFeed. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn Popup */}
      <SocialMediaPopup
        isOpen={isSocialMediaPopupOpen}
        onClose={() => setIsSocialMediaPopupOpen(false)}
        initialSocialMedia={selectedSocialMedia}
      />
    </footer>
  );
}

export default Footer;
