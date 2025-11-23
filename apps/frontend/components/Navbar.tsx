import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Activity } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold text-slate-100">
              UptimeGuard
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-slate-300 hover:text-slate-100 transition-colors"
            >
              About
            </a>
            <div className="flex items-center space-x-4">
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-slate-300 hover:text-slate-100 transition-colors font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
