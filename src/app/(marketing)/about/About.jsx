"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
const About = () => {
  gsap.registerPlugin(ScrollTrigger);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".one", {
        scrollTrigger: {
          trigger: ".one",
          scroller: "body",
          start: "top 100%",
          end: "top 0%",
          
        },
        opacity: 0,
        y: 300,
        duration: 0.8,
      });

      gsap.from([".two", ".three"], {
        scrollTrigger: {
          trigger: [".two", ".three"],
          scroller: "body",
          start: "top 100%",
          end: "top 0%",
         
        },
        opacity: 0,
        y: 300,
        duration: 0.8,
      });

      gsap.from(".four", {
        scrollTrigger: {
          trigger: ".four",
          scroller: "body",
          start: "top 100%",
          end: "top 0%",
         
        },
        opacity: 0,
        y: 300,
        duration: 0.8,
      });
      gsap.from(".five", {
        scrollTrigger: {
          trigger: ".five",
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

  const doctors = [
    {
      id: 1,
      image: "/doc1.png",
      name: "Dr. Ethan Ross",
      designation: "Orthopedic Surgeon",
    },
    {
      id: 2,
      image: "/doc2.png",
      name: "Dr. Benjamin Stone",
      designation: "Nephrologist",
    },
    {
      id: 3,
      image: "/doc3.png",
      name: "Dr. Aiden Brooks",
      designation: "Radiologist",
    },
    {
      id: 4,
      image: "/doc4.png",
      name: "Dr. James Carter",
      designation: "Pulmonologist",
    },
    {
      id: 5,
      image: "/doc5.png",
      name: "Dr. Elijah Brown",
      designation: "ENT Specialist",
    },
    {
      id: 6,
      image: "/doc6.png",
      name: "Dr. Noah Kim",
      designation: "Endocrinologist",
    },
  ];
  return (
    <>
      <div className="one px-5 mt-15 sm:px-10 md:px-16 lg:px-20 py-10 space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-start">
            Our journey to health innovation
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-lg text-start">
            Discover powerful features that help you monitor and manage your
            health effortlessly
          </p>
        </div>

        <div className="flex items-center justify-center">
          <Image
            className="w-full max-w-6xl rounded-3xl object-cover"
            src="/about.png"
            width={1200}
            height={600}
            alt="docs"
          />
        </div>
      </div>

      <div className="two px-5 sm:px-10 md:px-16 lg:px-20 py-10 text-center">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl leading-snug ">
              At Healix, we’re dedicated to empowering individuals on their
              health journeys
            </h1>
          </div>

          <div className="flex-1 space-y-8">
            <div className="mb-15">
              <h2 className="text-xl sm:text-2xl   mb-2">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                We believe in a future where everyone can take control of their
                wellness with tools that guide, support, and inspire daily
                healthy habits.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl mb-2">
                Our Vision
              </h2>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                Our vision is to transform health monitoring into an experience
                that’s not only insightful but also motivating — through a
                combination of real-time insights and actionable guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4 border-gray-300" />

      <div className="three px-5 sm:px-10 md:px-16 lg:px-20 py-10 text-center">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl leading-snug ">
              Healix began with a simple idea
            </h1>
          </div>

          <div className="flex-1 space-y-8">
            <div className="mb-15">
              <h2 className="text-xl sm:text-2xl mb-2">
                Our Story
              </h2>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                Healix was born to fill that gap, helping people turn their
                health data into meaningful actions that improve their quality
                of life.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                Our founders, a team of health professionals and tech
                innovators, saw the need for a health monitoring tool that
                combines accuracy with ease of use.
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4 border-gray-300" />

      <div className="four flex flex-col justify-center items-center">
        <h1 className="text-5xl mt-10 mb-10">Meet the team</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 p-15">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className=" rounded-2xl p-6 transition flex flex-col items-center text-center"
            >
              <div className="bg-[#F0F5F6] rounded-4xl shadow transition overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={doc.image}
                    width={500}
                    height={500}
                    alt={doc.name}
                    className="object-cover w-full h-full  duration-300 hover:scale-105 transition-all ease-in-out"
                  />
                </div>
              </div>

              <h2 className="text-xl mt-5 mb-2 font-semibold text-gray-800">
                {doc.name}
              </h2>
              <p className="text-md text-gray-400">{doc.designation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="five flex items-center justify-center p-15 text-center">
        <h1 className="text-6xl">
          Healix is redefining how people connect with their health data—{" "}
          <span className="text-gray-400">
            empowering them to make informed decisions every day.
          </span>
        </h1>
      </div>
    </>
  );
};

export default About;
