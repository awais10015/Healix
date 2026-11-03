"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Reviews = () => {
  gsap.registerPlugin(ScrollTrigger);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".review", {
        scrollTrigger: {
          trigger: ".review",
          scroller: "body",
          start: "top 100%",
          end: "top 0%",
          
        },
        opacity: 0,
        y: 300,
        duration: 0.8,
      });
    }, "");

    return () => ctx.revert();
  }, []);

  const reviews = [
    {
      id: 1,
      title: "Healix has been a game-changer for me.",
      subtitle:
        "I can now track my vitals and sleep patterns daily, and Healix has been a game-changer for me it’s helped me build healthier habits!",
      name: "Brooklyn Simmons",
      profession: "Product Manager",
      image: "/RU1.png",
    },
    {
      id: 2,
      title: "I love the doctor chat feature!",
      subtitle:
        "Using Healix has transformed my daily routine—I’m more aware of my health metrics and motivated to improve them!",
      name: "Arlene McCoy",
      profession: "Product Designer",
      image: "/RU2.png",
    },
    {
      id: 3,
      title: "Using Healix has completely transformed my health.",
      subtitle:
        "Thanks to Healix, I can monitor my sleep quality and heart rate effortlessly, helping me stay on top of my wellness goals.",
      name: "Daniel Caldwell",
      profession: "User Experience Designer",
      image: "/RU3.png",
    },
    {
      id: 4,
      title: "I can’t imagine managing my wellness without Healix now.",
      subtitle:
        "Getting expert advice on my health questions without leaving home has been incredibly convenient and I loved it so much!",
      name: "Michael Bennett",
      profession: "Visual Designer",
      image: "/RU4.png",
    },
    {
      id: 5,
      title: "Healix has taken my health tracking to the next level.",
      subtitle:
        "I love how Healix keeps me informed about my vitals; it’s encouraged me to make healthier choices every day.",
      name: "James Lawson",
      profession: "Interaction Designer",
      image: "/RU5.png",
    },
    {
      id: 6,
      title: "With Healix, staying on top of my goals feels effortless.",
      subtitle:
        "With Healix, I’m finally taking control of my fitness and sleep habits—it’s been an incredible addition to my wellness routine.",
      name: "Ethan Cole",
      profession: "Service Designer",
      image: "/RU6.png",
    },
    {
      id: 7,
      title: "Switching to Healix was the best choice for my wellness.",
      subtitle:
        "Healix has been amazing for staying mindful of my health—it’s helped me set and achieve meaningful wellness goals.",
      name: "Benjamin Tate",
      profession: "Visual Designer",
      image: "/RU7.png",
    },
    {
      id: 8,
      title: "Healix makes managing my health simple and effective.",
      subtitle:
        "Tracking my daily habits with Healix has made a big difference in my overall well-being—I feel more balanced and energized.",
      name: "Mason Reed",
      profession: "UI/UX Developer",
      image: "/RU8.png",
    },
  ];
  return (
    <>
      <div className="px-5 sm:px-10 lg:px-20 py-10">
        <div className="text-center mb-15 mt-10">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            What our users are saying
          </h1>
        </div>

        <div className="review grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            
              <div
                key={review.id}
                className=" bg-gray-100 rounded-2xl shadow-md p-6 flex flex-col gap-4 transition hover:shadow-lg"
              >
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Image
                      key={i}
                      src="/star.svg"
                      width={20}
                      height={20}
                      alt="star"
                      className="inline-block"
                    />
                  ))}
                </div>
                <hr className="mt-4 border-gray-300 w-24 mx-auto" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {review.title}
                </h2>
                <p className="text-gray-600 text-sm">{review.subtitle}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Image
                    src={review.image}
                    alt={review.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      {review.name}
                    </h3>
                    <p className="text-xs text-gray-500">{review.profession}</p>
                  </div>
                </div>
              </div>
            
          ))}
        </div>
      </div>
      <div className="w-full p-15">
        <div className="A2 flex flex-col lg:flex-row gap-8 mt-20">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black flex-2 leading-tight">
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
              <Link href="/doctors">
                <button className="bg-gray-400 text-black px-6 py-3 rounded-3xl text-sm sm:text-base hover:bg-gray-900 hover:cursor-pointer hover:text-white hover:scale-110 transition-all ease-in-out">
                  Start Session
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reviews;
