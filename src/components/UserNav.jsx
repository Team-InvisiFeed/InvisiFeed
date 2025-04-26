import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import {
  Loader2,
  UserCircle2,
  User,
  Ticket,
  LogOut,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import GSTINVerificationDialog from "@/components/owner-page-components/GSTINVerificationDialog";
import LoadingScreen from "./LoadingScreen";
import { MdMoney } from "react-icons/md";
import { SubscriptionPopup } from "./SubscriptionPopup";
import { Lock } from "lucide-react";

function UserNav({ isMobile = false }) {
  const { data: session } = useSession();
  const owner = session?.user;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [isSubscriptionPopupOpen, setIsSubscriptionPopupOpen] = useState(false);

  const [isGSTINDialogOpen, setIsGSTINDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Added state for controlling dropdown
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onManageProfile = () => {
    handleNavigation(`/user/${owner?.username}/update-profile`);
  };


  const onManageInvoice = () => {
    handleNavigation(`/user/${owner?.username}/show-invoices`);
  };

  const onManageCoupons = () => {
    handleNavigation(`/user/${owner?.username}/manage-coupons`);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setLoading(true); // Start loading state
    setIsDropdownOpen(false); // Close dropdown
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
  };

  const handleGetStarted = () => {
    setIsNavigatingToSignIn(true);

    setIsDropdownOpen(false); // Close dropdown
    router.push("/sign-in");
  };

  const handleUsernameClick = () => {
    setIsDropdownOpen(false); // Close dropdown
    handleNavigation(`/user/${owner?.username}`);
  };

  const handleNavigation = (route) => {
    if (route === pathname) {
      // Same route, no loading screen
      return;
    }
    setLoading(true);
    router.push(route);
  };

  const pathname = usePathname();

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, [pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!owner) {
    return (
      <Button
        onClick={handleGetStarted}
        disabled={isNavigatingToSignIn}
        className={`${
          isMobile ? "" : "hidden md:flex"
        } bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer min-w-[120px]`}
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
    );
  }


  

  return (
    <>
    <div className="flex items-center space-x-4">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
              <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                <UserCircle2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-[#0A0A0A] border border-yellow-400/10 rounded-lg shadow-lg shadow-yellow-500/10"
          align="end"
        >
          <div className="flex items-center justify-start p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p
                className="font-medium text-yellow-400 cursor-pointer"
                onClick={handleUsernameClick} // Close dropdown when username is clicked
              >
                {owner?.username}
              </p>
              <p className="text-sm text-gray-400">{owner?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-yellow-400/10" />
          <DropdownMenuItem
            className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer"
            onClick={onManageProfile}
          >
            <User className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Manage Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer ${
              owner?.plan?.planName === "free" ? "relative" : ""
            }`}
            onClick={() => {
              if (owner?.plan?.planName === "free" || owner?.plan?.planEndDate < new Date()) {
                setIsSubscriptionPopupOpen(true);
              } else {
                onManageInvoice(); 
              }
            }}
          >
            <Receipt className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Show Invoices</span>
            {(owner?.plan?.planName === "free" || owner?.plan?.planEndDate < new Date()) && (
              <Lock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer ${
              owner?.plan?.planName === "free" ? "relative" : ""
            }`}
            onClick={() => {
              if (owner?.plan?.planName === "free" || owner?.plan?.planEndDate < new Date()) {
                setIsSubscriptionPopupOpen(true);
              } else {
                onManageCoupons(); 
              }
            }}
          >
            <Ticket className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Manage Coupons</span>
            {(owner?.plan?.planName === "free" || owner?.plan?.planEndDate < new Date()) && (
              <Lock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
          </DropdownMenuItem>

          {!owner?.gstinDetails?.gstinVerificationStatus && (
            <DropdownMenuItem
              className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer"
              onClick={() => setIsGSTINDialogOpen(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-yellow-400" />
              <span>Verify GSTIN</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-yellow-400/10" />
          <DropdownMenuItem
            className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <GSTINVerificationDialog
        open={isGSTINDialogOpen}
        onOpenChange={setIsGSTINDialogOpen}
      />
      
    </div>

    <SubscriptionPopup
      isOpen={isSubscriptionPopupOpen}
      onClose={() => setIsSubscriptionPopupOpen(false)}
    />
    </>
    
  );
}

export default UserNav;
