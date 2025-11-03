// "use client"; // Force client-side rendering

// import { client } from "@/sanity/lib/client";
// import { Card } from "@/components/ui/card";
// import { ArrowUpRight } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { Button } from "../ui/button";
// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";

// // Post Interface
// interface Post {
//   _id: string;
//   title: string;
//   _createdAt: string;
//   slug: {
//     current: string;
//   };
//   mainImage?: {
//     asset?: {
//       url: string;
//     };
//   };
// }

// // BlogSection Component
// const BlogSection = () => {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         console.log("Fetching posts...");
//         const query = `*[_type == 'post'] | order(_createdAt desc) [0...3] { _id, title, _createdAt, slug, mainImage { asset->{ url } } }`;
//         const result = await client.fetch(query, {}, { cache: "no-store" });
//         console.log("Fetched Posts:", result);
//         setPosts(result);
//       } catch (error) {
//         console.error("Failed to fetch blog posts:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchPosts();
//   }, []);

//   if (loading) {
//     return <div className="text-center py-20">Loading posts...</div>;
//   }

//   return (
//     <section className="w-full py-20">
//       <motion.div
//         initial={{ opacity: 0, y: -5 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         viewport={{ once: true }}
//         className="w-full text-center mb-10 mx-auto"
//       >
//         {/* Badge */}
//         <div className="mx-auto inline-flex items-center gap-2 text-sm font-semibold text-purple-500 bg-purple-50 rounded-full px-4 py-1 border border-purple-500">
//           <span className="text-lg">📚</span>
//           Blog
//         </div>
//         {/* Title */}
//         <div className="mt-4 text-xl font-bold tracking-tight text-primary sm:text-3xl">
//           Explore Our Latest Articles
//         </div>
//         {/* Subtitle */}
//         <div className="mt-1 text-lg md:text-xl leading-8 text-primary/60">
//           Stay updated with tips, tricks, and guides to supercharge your studies
//           with GStudy.
//         </div>
//       </motion.div>

//       {/* Blog Cards */}
//       <motion.div
//         className="w-full max-w-6xl mx-auto grid gap-6 auto-rows-auto grid-cols-[repeat(auto-fill,minmax(320px,1fr))] mt-3"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true }}
//         variants={{
//           visible: { transition: { staggerChildren: 0.2 } },
//         }}
//       >
//         {posts.map((post) => {
//           const createdDate = new Date(post._createdAt).toLocaleDateString(
//             "en-US",
//             { year: "numeric", month: "long", day: "numeric" }
//           );

//           return (
//             <motion.div
//               key={post._id}
//               variants={{
//                 hidden: { opacity: 0, y: 5 },
//                 visible: { opacity: 1, y: 0 },
//               }}
//               transition={{ duration: 0.5, ease: "easeOut" }}
//             >
//               <Link href={`/blog/${post.slug.current}`}>
//                 <Card className="cursor-pointer relative overflow-hidden group rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-800 transition duration-300 ease-in-out">
//                   {post.mainImage?.asset?.url ? (
//                     <div className="w-full h-52 relative overflow-hidden rounded-t-lg">
//                       <Image
//                         src={post.mainImage.asset.url}
//                         alt={post.title || "Post Image"}
//                         layout="fill"
//                         objectFit="cover"
//                         className="transition duration-300 ease-in-out group-hover:opacity-85"
//                       />
//                     </div>
//                   ) : (
//                     <div className="w-full h-52 overflow-hidden rounded-t-lg bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
//                       No Image Available
//                     </div>
//                   )}
//                   <div className="w-full flex flex-row items-start justify-between px-5 pt-5 pb-4">
//                     <div className="text-base line-clamp-2 h-12 font-medium text-start text-black dark:text-white !leading-relaxed pr-5">
//                       {post.title}
//                     </div>
//                     <ArrowUpRight className="flex-shrink-0 size-6 text-black dark:text-white" />
//                   </div>
//                   <div className="text-sm font-base text-start px-5 pb-5 text-black/60 dark:text-white/70 !leading-relaxed">
//                     {createdDate}
//                   </div>
//                 </Card>
//               </Link>
//             </motion.div>
//           );
//         })}
//       </motion.div>

//       {/* Button */}
//       <motion.div
//         initial={{ opacity: 0, scale: 1 }}
//         whileInView={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5, delay: 0.3 }}
//         viewport={{ once: true }}
//         className="text-center mt-8"
//       >
//         <Link href="/blog">
//           <Button className="mt-2 h-11 text-sm md:text-[15px] mb-12 rounded-md font-bold bg-[#6127FF] hover:bg-[#6127FF]/80 text-white">
//             View All Articles <ArrowUpRight strokeWidth={3} className="ml-2 size-5" />
//           </Button>
//         </Link>
//       </motion.div>
//     </section>
//   );
// };

// export default BlogSection;




import { client } from "@/sanity/lib/client";
import BlogSectionClient from "./blog-section-client";

// Metadata
export const metadata = {
  title: "GStudy Blog - Latest Tips and Updates",
  description:
    "Explore the GStudy Blog for tips, updates, and insights to improve your study productivity. Learn about AI-powered tools, note-taking techniques, and more.",
};

// Post Interface
interface Post {
  _id: string;
  title: string;
  _createdAt: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset?: {
      url: string;
    };
  };
}

// Server-side fetch for posts
async function getPosts(): Promise<Post[]> {
  const query = `
    *[_type == 'post'] | order(_createdAt desc) [0...3] {
        _id,
        title,
        _createdAt,
        slug,
        mainImage {
            asset->{
                url
            }
        }
    }
  `;
  return await client.fetch(query, {}, { cache: "no-store" });
}

// Server-rendered parent component
export default async function BlogSection() {
  const posts = await getPosts(); // Server-side fetch
  return <BlogSectionClient posts={posts} />;
}
