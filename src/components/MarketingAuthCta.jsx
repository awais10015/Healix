"use client";

import Link from "next/link";

export default function MarketingAuthCta({ children, className = "" }) {
  return (
    <Link href="/sign-in?redirect_url=/dashboard">
      <button type="button" className={className}>
        {children}
      </button>
    </Link>
  );
}
