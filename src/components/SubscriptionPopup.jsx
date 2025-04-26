import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

export const SubscriptionPopup = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
   const handleNavigation = (route) => {
      if (route === pathname) {
        // Same route, no loading screen
        return;
      }
      setLoading(true);
      router.push(route);
    };
    
  
    useEffect(() => {
      return () => {
        setLoading(false);
      };
    }, [pathname]);
  
    if (loading) {
      return <LoadingScreen />;
    }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Lock className="h-12 w-12 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold">Upgrade to Pro</h3>
              
              <p className="text-gray-600">
                Upgrade to Pro to unlock premium features.
              </p>

              <div className="pt-4">
                
                  <Button className="w-full cursor-pointer" onClick={() => handleNavigation("/pricing")}>
                    View Pricing Plans
                  </Button>
               
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};