"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { ModeToggle } from "./modeToggle";
import { useAuth } from "@/context/AuthProvider";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  return (
    <div className="h-20 w-full px-6 md:px-10 flex justify-between items-center text-md relative">
      <div className="shrink-0">
        <Link href="/">
          <Image
            className="dark:invert"
            src="/logo.svg"
            height={150}
            width={150}
            alt="Healix logo"
            priority
          />
        </Link>
      </div>

      <div className="hidden md:flex gap-8">
        <Link
          href="/"
          className="hover:text-orange-800 hover:scale-105 transition-all ease-in-out"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="hover:text-orange-800 hover:scale-105 transition-all ease-in-out"
        >
          About
        </Link>
        <Link
          href="/reviews"
          className="hover:text-orange-800 hover:scale-105 transition-all ease-in-out"
        >
          Reviews
        </Link>
      </div>

      <div className="hidden md:flex gap-4 items-center">
        <ModeToggle />
        <header className="flex justify-end items-center gap-4">
          {!user ? (
            <>
              <Link
                href="/sign-in?redirect_url=/dashboard"
                className="text-foreground hover:text-orange-800"
              >
                Sign in
              </Link>
              <Link href="/sign-up">
                <button className="bg-primary hover:cursor-pointer text-primary-foreground rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-primary/90 transition-colors">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="hover:text-orange-800 font-medium"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm hover:text-orange-800"
              >
                Log out
              </button>
            </>
          )}
        </header>
      </div>

      <div className="md:hidden">
        <button type="button" onClick={() => setMenuOpen(!menuOpen)}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-20 bg-gray-500 text-lg p-5 right-0 rounded-md  flex flex-col justify-center items-center gap-3 z-50 w-full md:hidden transition-all ease-in-out">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/reviews">Reviews</Link>
          <ModeToggle />
          {!user ? (
            <>
              <Link href="/sign-in">Sign in</Link>
              <Link href="/sign-up">Sign up</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button type="button" onClick={() => logout()}>
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
