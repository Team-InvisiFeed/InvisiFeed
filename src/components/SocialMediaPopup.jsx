"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Linkedin, Github, Twitter } from "lucide-react";

const creators = [
  {
    name: "Shubh Verma",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/shubh-v21",
    github: "https://github.com/shubh-v21",
    twitter: "https://twitter.com/shubhonx",
    description:
      "Passionate about building scalable web applications and creating seamless user experiences.",
  },
  {
    name: "Sneha Sharma",
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/ss0807/",
    github: "https://github.com/SnehaSharma245",
    twitter: "https://twitter.com/SnehaDevs",
    description:
      "Dedicated to crafting beautiful and intuitive user interfaces that make a difference.",
  },
];

export default function SocialMediaPopup({ isOpen, onClose, initialSocialMedia }) {
  const [socialMediaSwitch, setSocialMediaSwitch] = useState(initialSocialMedia || null);

  useEffect(() => {
    if (isOpen) {
      setSocialMediaSwitch(initialSocialMedia);
    }
  }, [isOpen, initialSocialMedia]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0A0A0A] rounded-xl border border-yellow-400/20 p-6 max-w-2xl w-full relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-yellow-400/10 transition-colors"
            >
              <X className="h-5 w-5 text-yellow-400" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                Meet Our Creators
              </h2>
              <p className="text-gray-400 mt-2">
                Connect with the brilliant minds behind InvisiFeed
              </p>
            </div>

            {/* Switch Social Media Icons */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setSocialMediaSwitch("github")}
                className="text-gray-400 mx-4 cursor-pointer hover:text-yellow-400 transition-colors"
              >
                <Github />
              </button>
              <button
                onClick={() => setSocialMediaSwitch("linkedin")}
                className="text-gray-400 mx-4 cursor-pointer hover:text-yellow-400 transition-colors"
              >
                <Linkedin />
              </button>
              <button
                onClick={() => setSocialMediaSwitch("twitter")}
                className="text-gray-400 mx-4 cursor-pointer hover:text-yellow-400 transition-colors"
              >
                <Twitter />
              </button>
            </div>

            {/* Creators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creators.map((creator, index) => (
                <motion.div
                  key={creator.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg border border-yellow-400/10 p-4 hover:border-yellow-400/20 transition-colors group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-400">
                        {creator.name}
                      </h3>
                      <p className="text-sm text-gray-400">{creator.role}</p>
                      <p className="text-sm text-gray-500 mt-2">{creator.description}</p>

                      {socialMediaSwitch === "github" && (
                        <a
                          href={creator.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <Github className="h-4 w-4" />
                          <span className="text-sm">Connect on GitHub</span>
                        </a>
                      )}
                      {socialMediaSwitch === "linkedin" && (
                        <a
                          href={creator.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                          <span className="text-sm">Connect on LinkedIn</span>
                        </a>
                      )}
                      {socialMediaSwitch === "twitter" && (
                        <a
                          href={creator.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <Twitter className="h-4 w-4" />
                          <span className="text-sm">Connect on Twitter</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Follow us to stay updated with our latest developments and
                insights
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
