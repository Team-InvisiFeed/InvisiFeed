"use client";
import React from "react";

function Footer() {
  return (
    <footer className="p-6 bg-gray-800 text-gray-200">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-start">
          <a href="#" className="text-2xl font-bold text-white">
            InvisiFeed
          </a>
          <p className="mt-2 text-sm text-gray-400">
            Connecting people with invisible threads of care and connection.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <i className="fab fa-facebook"></i>{" "}
              {/* Replace with actual icons */}
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © 2025 InvisiFeed. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
