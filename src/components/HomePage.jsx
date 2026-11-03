"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import MarketingAuthCta from "@/components/MarketingAuthCta";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function scrollReveal(selector, vars = {}) {
  gsap.from(selector, {
    scrollTrigger: {
      trigger: selector,
      start: "top 85%",
      once: true,
    },
    opacity: 0,
    y: vars.y ?? 80,
    duration: vars.duration ?? 0.6,
    delay: vars.delay ?? 0,
    immediateRender: false,
    ease: "power2.out",
  });
}

const HomePage = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".hero", {
        opacity: 0,
        y: 48,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".why", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        delay: 0.15,
        ease: "power2.out",
      });

      scrollReveal(".card1", { y: 80, duration: 0.5 });
      scrollReveal(".card2", { y: 80, duration: 0.5, delay: 0.15 });
      scrollReveal(".card3", { y: 80, duration: 0.5, delay: 0.3 });
      scrollReveal(".heading1", { y: 60, duration: 0.7 });
      scrollReveal(".C1", { y: 80, duration: 0.7 });
      scrollReveal(".C2", { y: 60, duration: 0.7 });
      scrollReveal(".all", { y: 80, duration: 0.7 });
      scrollReveal(".A1", { y: 80, duration: 0.7 });
    }, pageRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <div className="w-full p-5 sm:p-10 lg:p-10 mb-10">
        <div className="hero bg-[url('/hero.png')] bg-cover bg-center w-full h-full flex flex-col justify-center items-start text-center text-white p-10 rounded-3xl">
          <h1 className="text-4xl mt-10 md:text-5xl text-start font-bold mb-4 lg:w-80">
            Where care meets innovation
          </h1>
          <h5 className="text-lg md:text-xl text-start max-w-xl mb-6 lg:w-80">
            From daily wellness to advanced health insights, our platform is
            designed to support you.
          </h5>
          <MarketingAuthCta className="bg-primary text-primary-foreground px-6 py-3 rounded-3xl hover:cursor-pointer hover:scale-110 transition-all ease-in-out hover:bg-primary/90 mb-10">
            Start Session
          </MarketingAuthCta>
        </div>
      </div>

      <div className="why flex gap-10 pl-10 pr-10 flex-col md:flex-row sm:flex-row">
        <div className="flex-1 text-5xl sm:text-7xl font-black text-center">
          Why choose Healix for health tracking & monitoring?
        </div>
        <div className="flex-1 flex flex-col gap-5 p-2 justify-evenly items-center">
          <h5 className="text-lg">
            Healix is designed to help you track and understand your health in
            real time. Whether it's monitoring vital signs, activity levels, or
            health patterns to make informed decisions for a healthier
            lifestyle.
          </h5>

          <MarketingAuthCta className="bg-gray-600 w-50 text-white rounded-3xl p-3 hover:cursor-pointer hover:scale-110 transition-all ease-in-out">
            Get Consultation
          </MarketingAuthCta>
        </div>
      </div>

      <div className="mt-15 flex flex-col lg:flex-row justify-center items-stretch gap-6 px-5 sm:px-6 md:px-10 lg:px-16 xl:px-20 mb-20">
        
        <div className="card1 flex-1 bg-[#F0F5F6] rounded-3xl p-6 flex flex-col justify-between items-center text-center">
          <h1 className="text-xl text-black font-semibold mb-4">
            Enhanced health awareness
          </h1>

          <div>
            {" "}
            <h5 className="text-gray-500 mb-10">
              Healix encourages users to stay active through custom goals.
            </h5>
            <div className="flex items-center justify-between w-full px-4">
              <Image src="/union1.svg" alt="union" width={100} height={100} />
              <h1 className="text-5xl text-black font-bold">250k+</h1>
            </div>
          </div>
        </div>

        <div className="card2 flex-1 bg-[url('/unionBG.png')] bg-cover bg-center rounded-3xl p-6 flex flex-col justify-between items-start text-center text-white backdrop-blur-sm">
          <div className="text-2xl font-semibold flex flex-col items-start mb-6">
            <h1 className="bg-white rounded-3xl text-xl text-black p-2">
              Boost in physical
            </h1>
            <h1 className="bg-white rounded-3xl text-xl text-black p-2">
              activity levels
            </h1>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Step Count",
              "Physical Activity",
              "Custom Goals",
              "Cardiovascular",
              "Fitness",
            ].map((label, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-2xl bg-white/10 border border-white/30 backdrop-blur-lg text-black text-sm hover:bg-white/20 transition"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        
        <div className="card3 flex-1 bg-[#F0F5F6] rounded-3xl p-6 flex flex-col justify-between items-center text-center">
          <h1 className="text-xl text-black font-semibold mb-4">
            Faster response to health changes
          </h1>
          <h5 className="text-gray-500 mb-10">
            Healix inspires you to keep moving with tailored objectives.
          </h5>
          <div className="flex items-center justify-between w-full px-4">
            <Image src="/union2.svg" alt="union" width={100} height={100} />
            <h1 className="text-5xl text-black font-bold">78.00%</h1>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10">
      
        <div className="heading1 flex flex-col lg:flex-row gap-6 mb-10">
          <h1 className="flex-1 text-3xl sm:text-4xl lg:text-5xl font-black">
            Features designed for your health journey
          </h1>
          <p className="flex-1 mt-2 text-gray-400 text-base sm:text-lg">
            Healix is designed to help you track and understand your health to
            make informed decisions for a healthier lifestyle.
          </p>
        </div>

       
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="C1 bg-[#F0F5F6] p-6 sm:p-10 rounded-3xl flex flex-col shadow-md lg:flex-1 text-start">
            <h1 className="text-2xl text-black sm:text-3xl font-bold mb-4">
              Get answers to your health questions
            </h1>
            <h3 className="text-base sm:text-lg text-gray-600 mb-6">
              Healix encourages users to stay active.
            </h3>
            <Image
              className="rounded-3xl object-cover"
              src="/demo1.png"
              alt="chat"
              width={350}
              height={450}
            />
          </div>

          <div className="C1 bg-[#F0F5F6] p-6 sm:p-10 rounded-3xl flex flex-col shadow-md lg:flex-[1.5] text-start">
            <h1 className="text-2xl text-black sm:text-3xl font-bold mb-4">
              Find answers to all your health concerns
            </h1>
            <h3 className="text-base sm:text-lg text-gray-600 mb-6">
              Healix inspires users to maintain activity.
            </h3>
            <Image
              className="rounded-3xl object-cover w-full h-auto"
              src="/demo2.png"
              alt="meeting"
              width={600}
              height={350}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-5 sm:px-10 lg:px-20 py-10">
        
        <div className="C2 bg-[#F0F5F6] p-6 sm:p-10 rounded-3xl flex flex-col shadow-md lg:flex-[1.8] text-start">
          <h1 className="text-2xl text-black sm:text-3xl font-bold mb-4">
            Find solutions to your health inquiries
          </h1>
          <h3 className="text-base sm:text-lg text-gray-600 mb-6">
            Healix motivates users to stay active.
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
          
            <div className="flex-[1.2]">
              <Image
                className="rounded-2xl w-full h-auto object-cover"
                src="/demo3.png"
                alt="chat1"
                width={600}
                height={300}
              />
            </div>

           
            <div className="flex-[0.8]">
              <Image
                className="rounded-2xl w-full h-auto object-cover"
                src="/demo4.png"
                alt="chat2"
                width={400}
                height={300}
              />
            </div>
          </div>
        </div>

        
        <div className="C2 bg-[#F0F5F6] p-6 sm:p-10 rounded-3xl flex flex-col shadow-md lg:flex-[1] text-start">
          <h1 className="text-2xl text-black sm:text-3xl font-bold mb-4">
            Discover answers to your health concerns
          </h1>
          <h3 className="text-base sm:text-lg text-gray-600 mb-6">
            Healix helps users embrace an active life.
          </h3>
          <Image
            className="rounded-2xl object-cover w-full h-auto"
            src="/demo5.png"
            alt="meeting"
            width={600}
            height={350}
          />
        </div>
      </div>

      <div className=" w-full px-5 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10">
        <div className=" relative w-full h-[80vh] rounded-3xl overflow-hidden">
         
          <div className="all absolute inset-0 bg-[url('/upperbg.png')] bg-cover bg-center brightness-50 rounded-3xl"></div>

        
          <div className="relative z-10 h-full flex items-center px-5 sm:px-6 md:px-10 lg:px-16 xl:px-20">
            <div className="w-full md:w-1/2 text-white space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug">
                Receive tailored health tips and alerts based on your individual
                data trends,{" "}
                <span className="text-primary/80">
                  helping you make proactive adjustments
                </span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="A1 px-5 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-10 mt-10">
        
        <h1 className=" text-xl sm:text-3xl lg:text-5xl font-semibold  mb-6">
          Studies show that proactive health tracking can reduce chronic{" "}
          <span className="text-primary font-bold">
            health risks by up to 78%
          </span>
        </h1>

        
        <div className=" relative mt-5 bg-[url('/lowerbg.png')] bg-cover bg-center rounded-3xl overflow-hidden py-10">
          
          <div className="absolute inset-0 bg-black/10 rounded-3xl z-0"></div>

         
          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-end px-5 sm:px-6 md:px-10 lg:px-16 xl:px-20">
          
            <div className="flex flex-wrap gap-3">
              {[
                "Rehabilitation",
                "Healthcare",
                "Monitoring",
                "Technology",
                "Personalized",
              ].map((label, i) => (
                <button
                  key={i}
                  className="px-4 py-2 rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 text-black font-bold text-sm hover:bg-white/30 transition"
                >
                  {label}
                </button>
              ))}
            </div>

           
            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md w-full mt-6 lg:mt-6 lg:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Health Monitoring Matters
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                Studies show that proactive health tracking can reduce chronic
                health risks by up to:
              </p>
              <h1 className="text-4xl font-extrabold text-primary">78%</h1>
            </div>
          </div>
        </div>

        <div className="A2 flex flex-col lg:flex-row gap-8 mt-20">
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black flex-2 leading-tight ">
            Speak with one of our health tech experts to discover{" "}
            <span className="text-gray-600 block lg:inline">
              how Healix can support your wellness journey.
            </span>
          </h1>

        
          <div className=" flex-1 flex flex-col justify-center gap-6 mt-6 lg:mt-0">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Start your health journey with Healix today. Your health, your
              data, your power.
            </p>
            <div>
              <MarketingAuthCta className="bg-gray-600 text-white px-6 py-3 rounded-3xl text-sm sm:text-base hover:bg-gray-900 hover:cursor-pointer hover:scale-110 transition-all ease-in-out">
                Start Session
              </MarketingAuthCta>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
