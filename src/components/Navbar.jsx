"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "./LoadingScreen";
import { Loader2, UserCircle2, Menu, X } from "lucide-react";

function Navbar() {
  const { data: session, status } = useSession();
  const owner = session?.user;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [isNavigatingToProfile, setIsNavigatingToProfile] = useState(false);
  const [isNavigatingToCoupons, setIsNavigatingToCoupons] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const mobileMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  // Reset navigation states when pathname changes
  useEffect(() => {
    if (pathname.includes("/update-profile")) {
      setIsNavigatingToProfile(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname.includes("/manage-coupons")) {
      setIsNavigatingToCoupons(false);
    }
  }, [pathname]);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll behavior for navbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (isMobile) {
        // Mobile behavior: Show on scroll up, hide on scroll down
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsNavbarVisible(false);
        } else {
          setIsNavbarVisible(true);
        }
      } else {
        // Desktop behavior: Hide on scroll down
        if (currentScrollY > 100) {
          setIsNavbarVisible(false);
        } else {
          setIsNavbarVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobile]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleNavigation = (route) => {
    router.push(route);
    setIsMobileMenuOpen(false);
  };

  const onManageProfile = () => {
    setIsNavigatingToProfile(true);
    router.push(`/user/${owner?.username}/update-profile`);
    setIsMobileMenuOpen(false);
  };

  const onManageCoupons = () => {
    setIsNavigatingToCoupons(true);
    router.push(`/user/${owner?.username}/manage-coupons`);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    setIsNavigatingToSignIn(true);
    router.push("/sign-in");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 p-4 md:p-6 bg-[#0A0A0A] text-white shadow-lg border-b border-yellow-400/10 transition-transform duration-300 ${
        isNavbarVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <motion.button
          onClick={() => {
            if (owner) {
              handleNavigation(`/user/${owner?.username}`);
            } else {
              handleNavigation("/");
            }
          }}
          className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          InvisiFeed
        </motion.button>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-6 absolute left-1/2 -translate-x-1/2">
          {owner ? (
            <>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#dashboard`);
                  document
                    .getElementById("dashboard")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}`
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.button>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#generate`);
                  document
                    .getElementById("generate")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}`
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate
              </motion.button>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#ratings`);
                  document
                    .getElementById("ratings")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}`
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ratings
              </motion.button>
              <motion.button
                onClick={() => {
                  handleNavigation(`/user/${owner?.username}#feedbacks`);
                  document
                    .getElementById("feedbacks")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}`
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Feedbacks
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(`/user/${owner?.username}#contact`);
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors ${
                  pathname === `/user/${owner?.username}`
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact
              </motion.button>
            </>
          ) : (
            <>
              <Link
                href="/"
                className={`text-gray-300 hover:text-yellow-400 transition-colors ${
                  pathname === "/" ? "font-bold text-yellow-400" : ""
                }`}
              >
                Home
              </Link>
              <Link
                href="#about"
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-gray-300 hover:text-yellow-400 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Contact
              </Link>
            </>
          )}
        </div>

        {/* Login Button - Desktop */}
        {!owner ? (
          <Button
            onClick={handleGetStarted}
            disabled={isNavigatingToSignIn}
            className="hidden md:flex bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer min-w-[120px]"
          >
            {isNavigatingToSignIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
                  <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                    <UserCircle2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-[#0A0A0A] border border-yellow-400/10 rounded-lg shadow-lg shadow-yellow-500/10"
                align="end"
                sideOffset={5}
              >
                <div className="px-2 py-1.5 border-b border-yellow-400/10">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 border border-yellow-400/30">
                      <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                        <UserCircle2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-yellow-400">
                        {owner?.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {owner?.email}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem
                  className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400"
                  onClick={onManageProfile}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Manage Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400"
                  onClick={onManageCoupons}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Manage Coupons
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400"
                  onClick={handleSignOut}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          {owner ? (
            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="focus:outline-none"
                >
                  <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
                    <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                      <UserCircle2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0A0A0A] border border-yellow-400/10 rounded-lg shadow-lg shadow-yellow-500/10 z-50">
                    <div className="px-2 py-1.5 border-b border-yellow-400/10">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 border border-yellow-400/30">
                          <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                            <UserCircle2 className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-yellow-400">
                            {owner?.username}
                          </span>
                          <span className="text-xs text-gray-400">
                            {owner?.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400 flex items-center"
                      onClick={() => {
                        onManageProfile();
                        setIsProfileDropdownOpen(false);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Manage Profile
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400 flex items-center"
                      onClick={() => {
                        onManageCoupons();
                        setIsProfileDropdownOpen(false);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Manage Coupons
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 cursor-pointer focus:bg-yellow-400/5 focus:text-yellow-400 flex items-center"
                      onClick={() => {
                        handleSignOut();
                        setIsProfileDropdownOpen(false);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Button
              onClick={handleGetStarted}
              disabled={isNavigatingToSignIn}
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer min-w-[120px]"
            >
              {isNavigatingToSignIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          )}

          <button
            onClick={toggleMobileMenu}
            className="ml-4 text-gray-300 hover:text-yellow-400 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0A0A0A] border-t border-yellow-400/10"
          >
            <div className="container mx-auto py-4">
              {owner ? (
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => {
                      handleNavigation(`/user/${owner?.username}#dashboard`);
                      document
                        .getElementById("dashboard")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation(`/user/${owner?.username}#generate`);
                      document
                        .getElementById("generate")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors"
                  >
                    Generate
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation(`/user/${owner?.username}#ratings`);
                      document
                        .getElementById("ratings")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors"
                  >
                    Ratings
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation(`/user/${owner?.username}#feedbacks`);
                      document
                        .getElementById("feedbacks")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors"
                  >
                    Feedbacks
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(`/user/${owner?.username}#contact`);
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors"
                  >
                    Contact
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Link
                    href="/"
                    className={`text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors ${
                      pathname === "/" ? "font-bold text-yellow-400" : ""
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="#about"
                    className="text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="#contact"
                    className="text-gray-300 hover:text-yellow-400 py-2 px-4 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Contact
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
