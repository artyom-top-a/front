"use client";
import React from "react";
import { motion } from "framer-motion"; // Import Framer Motion
import { Star } from "lucide-react";

const reviews = [
  // {
  //   name: "Emily, UK",
  //   username: "@emilyrose",
  //   review:
  //     "I've always struggled with creating effective study notes, but this app's AI card generation has made it so much easier! It saves me hours of prep work, and I feel like I'm finally studying smart instead of hard.",
  //   avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  // },
  // {
  //   name: "Michael, USA",
  //   username: "@mikeyb21",
  //   review:
  //     "This app has been a game-changer for me. The AI-generated cards and summaries help me keep up with my demanding college schedule. Highly recommend it to anyone who wants to study efficiently!",
  //   avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  // },
  // {
  //   name: "Sophia, Germany",
  //   username: "@sophiabloom",
  //   review:
  //     "Sharing my study cards with friends has never been easier! The AI chat feature answers my questions faster than Googling. Love this app for group projects and individual study.",
  //   avatar: "https://randomuser.me/api/portraits/women/33.jpg",
  // },
  // {
  //   name: "Lucas, France",
  //   username: "@luc_thefox",
  //   review:
  //     "This app's focus on key features makes it one of the best study tools I've used. AI-generated flashcards save so much time, and the ability to chat with AI for quick clarifications is just brilliant!",
  //   avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  // },
  // {
  //   name: "Olivia, UK",
  //   username: "@livybee",
  //   review:
  //     "This app has completely transformed the way I study. The AI is so accurate in generating summaries, and the sharing function means my friends and I can collaborate effortlessly.",
  //   avatar: "https://randomuser.me/api/portraits/women/5.jpg",
  // },
  // {
  //   name: "Ethan, USA",
  //   username: "@ethan_dude",
  //   review:
  //     "As a high school student, I often feel overwhelmed with homework and tests. This app has helped me focus on what's really important. The AI cards are spot-on, and I love how I can quickly share them with my study group.",
  //   avatar: "https://randomuser.me/api/portraits/men/6.jpg",
  // },
  // {
  //   name: "Anna, Italy",
  //   username: "@anna_bella",
  //   review:
  //     "Thanks to this app, I've cut my study time in half while still retaining more information. It's super easy to use, and the AI chat feels like having a personal tutor 24/7.",
  //   avatar: "https://randomuser.me/api/portraits/women/37.jpg",
  // },
  // {
  //   name: "James, USA",
  //   username: "@jameson87",
  //   review:
  //     "I've used a lot of study apps, but this one is by far the most intuitive. The AI cards are tailored to my needs, and I can share them with classmates instantly. Perfect for college students like me!",
  //   avatar: "https://randomuser.me/api/portraits/men/8.jpg",
  // },
  // {
  //   name: "Charlotte, UK",
  //   username: "@charlie_xx",
  //   review:
  //     "This app has made group projects so much easier! The sharing feature lets my team collaborate in real time, and the AI always helps me when I'm stuck. I wish I'd discovered this sooner!",
  //   avatar: "https://randomuser.me/api/portraits/women/9.jpg",
  // },



  {
    "name": "Priya K.",
    "degree": "Biomed Student",
    "stars": 5,
    "content": "Honestly, GStudy is clutch. I just drag in my lecture slides and boom — flashcards. No more staying up late trying to rewrite notes."
  },
  {
    "name": "Matteo R.",
    "degree": "CS Major",
    "stars": 5,
    "content": "Used to waste so much time rewatching lectures on 2x speed. Now I just drop the YouTube link and get everything I need in one place."
  },
  {
    "name": "Tobias N.",
    "degree": "Mech Eng",
    "stars": 5,
    "content": "I’ll literally copy-paste a confusing paragraph into the AI chat and it explains it better than my professor ever did lol."
  },
  {
    "name": "Leila M.",
    "degree": "CS Major",
    "stars": 5,
    "content": "Our group chat is basically just GStudy decks now 😂 Makes working on group projects way less chaotic."
  },
  {
    "name": "Hanna V.",
    "degree": "Law Student",
    "stars": 5,
    "content": "Threw a massive PDF into it the night before my oral exam. Got a clean summary + flash cards and somehow passed with zero panic."
  },
  {
    "name": "Sophia G.",
    "degree": "Psychology Student",
    "stars": 5,
    "content": "GStudy breaks down YouTube tutorials into flashcards and summaries so fast. I don’t even rewatch videos anymore — just drop the link and I’m good."
  },
  {
    "name": "Marcus J.",
    "degree": "History Student",
    "stars": 5,
    "content": "I vibe with how simple it is. No ads, no fluff — just drop your stuff in and boom: flashcards and summaries you can actually understand."
  },
  {
    "name": "Amin B.",
    "degree": "Electrical Eng",
    "stars": 5,
    "content": "Didn’t expect to like it this much. Flashcards are 🔥 and it works with any PDF. Sharing with friends is super easy too."
  },
  {
    "name": "Ali R.",
    "degree": "Civil Engineering",
    "stars": 5,
    "content": "It’s perfect for last-minute prep. I use it to turn lecture slides into flashcards and quickly review stuff before quizzes. Super underrated tool."
  },




  // {
  //   name: "Daniel, Spain",
  //   username: "@dan_theman",
  //   review:
  //     "The simplicity and efficiency of this app are incredible. I can generate flashcards and study materials in seconds. It's perfect for someone like me who's always juggling multiple assignments.",
  //   avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  // },



  // {
  //   name: "Mia, USA",
  //   username: "@mia2007",
  //   review:
  //     "I thought studying was supposed to be stressful, but GStudy changed that for me. It's simple, fast, and the AI cards help me focus on what's important. I use it every day!",
  //   avatar: "https://randomuser.me/api/portraits/women/20.jpg",
  // },
  // {
  //   name: "Alex, UK",
  //   username: "@alex_uk",
  //   review:
  //     "GStudy has been my go-to app during finals. The AI-generated content is accurate and concise, and the ability to collaborate with classmates has saved me so much time.",
  //   avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  // },
  // {
  //   name: "Isabella, Netherlands",
  //   username: "@linda_can",
  //   review:
  //     "I&apos;m not great at organizing my study notes, but GStudy does it all for me. The AI generation is incredibly accurate, and the chat feature answers my questions in a way that's easy to understand.",
  //   avatar: "https://randomuser.me/api/portraits/women/19.jpg",
  // },
  // {
  //   name: "James, Australia",
  //   username: "@james_aus",
  //   review:
  //     "Being able to generate study materials on-demand is amazing. GStudy's AI cards are spot-on, and I can focus more on understanding topics rather than wasting time organizing my notes.",
  //   avatar: "https://randomuser.me/api/portraits/men/24.jpg",
  // },
  // {
  //   name: "Lily, New Zealand",
  //   username: "@lily_nz",
  //   review:
  //     "I love how GStudy focuses on what matters most. The AI cards are super effective, and I can share materials with my friends in seconds. It's a lifesaver for group studies!",
  //   avatar: "https://randomuser.me/api/portraits/women/18.jpg",
  // },

];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="w-full py-20">
      <div className="mx-auto max-w-screen-xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto inline-flex items-center gap-2 text-sm font-semibold text-purple-500 bg-purple-50 rounded-full px-4 py-1 border border-purple-500"
        >
          <span className="text-lg">💬</span>
          Testimonials
        </motion.div>

        {/* Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center mt-3"
        >
          <div className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            What People Are Saying About Us
          </div>
          <div className="mt-1 text-lg leading-8 text-primary/60">
            Hear from our users about their experiences and how we’ve made a
            difference.
          </div>
        </motion.div>

        <motion.div
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 1, y: 0 },
                visible: { opacity: 1, scale: 1, y: 0 },
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="break-inside-avoid bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-transform"
            >
              <div className="flex items-center mb-2">
                {/* <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full mr-4"
                /> */}
                <div className="w-full">
                  <div className="w-full flex flex-row items-center justify-between">
                    <div className="text-[15px] font-semibold text-gray-800 text-start">
                      {review.name} 
                    </div>
                    <div className="text-[14px] font-regular text-gray-600 text-start">
                      {review.degree}
                    </div>
                  </div>
                  <div className="flex flex-row items-center space-x-1 mt-1.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-orange-400 text-orange-500" />
                    ))}
                  </div>
                  {/* <div className="text-sm text-gray-500 text-start">
                    {review.username}
                  </div> */}
                </div>
              </div>
              <div className="text-gray-600 text-start text-sm line-clamp-5">
                {review.content}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
