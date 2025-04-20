"use client";
import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { Loader2, UserCircle2, User, Ticket, LogOut, CheckCircle2 } from "lucide-react";
import GSTINVerificationDialog from "@/components/owner-page-components/GSTINVerificationDialog";

function UserNav({ isMobile = false }) {
  const { data: session } = useSession();
  const owner = session?.user;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [isNavigatingToProfile, setIsNavigatingToProfile] = useState(false);
  const [isNavigatingToCoupons, setIsNavigatingToCoupons] = useState(false);
  const [isGSTINDialogOpen, setIsGSTINDialogOpen] = useState(false);
  const router = useRouter();

  const onManageProfile = () => {
    setIsNavigatingToProfile(true);
    router.push(`/user/${owner?.username}/update-profile`);
  };

  const onManageCoupons = () => {
    setIsNavigatingToCoupons(true);
    router.push(`/user/${owner?.username}/manage-coupons`);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
  };

  const handleGetStarted = () => {
    setIsNavigatingToSignIn(true);
    router.push("/sign-in");
  };

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
    <div className="flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <button
            className="focus:outline-none"
          >
            <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
              <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                <UserCircle2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#0A0A0A] border border-yellow-400/10 rounded-lg shadow-lg shadow-yellow-500/10" align="end">
          <div className="flex items-center justify-start p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-yellow-400">{owner?.username}</p>
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
            className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer"
            onClick={onManageCoupons}
          >
            <Ticket className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Manage Coupons</span>
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
  );
}

export default UserNav;
