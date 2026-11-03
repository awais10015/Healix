import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border p-6 md:p-10 mt-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Healix logo"
          width={200}
          height={150}
          className="object-contain dark:invert"
        />
      </Link>

        
        <div className="flex flex-wrap justify-center gap-4 text-muted-foreground font-medium text-sm md:text-base">
          <Link href="/doctors" className="hover:text-gray-500 transition">Doctor</Link>
          <Link href="/reports" className="hover:text-gray-500 transition">Reports</Link>
          <Link href="/reviews" className="hover:text-gray-500 transition">Reviews</Link>
          <Link href="/about" className="hover:text-gray-500 transition">About</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
