import { client } from "@/sanity/lib/client";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
    title: "GStudy Blog - Latest Tips and Updates",
    description:
        "Explore the GStudy Blog for tips, updates, and insights to improve your study productivity. Learn about AI-powered tools, note-taking techniques, and more.",
    openGraph: {
        title: "GNotes Blog - Latest Tips and Updates",
        description:
            "Explore the GStudy Blog for tips, updates, and insights to improve your study productivity. Learn about AI-powered tools, note-taking techniques, and more.",
        url: "https://gstudy.pro/blog",
        images: [
            {
                url: "https://gstudy.pro/blog-og-image.jpg",
                alt: "GNotes Blog Banner",
            },
        ],
    },
};


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

async function getPosts(): Promise<Post[]> {
    const query = `
    *[_type == 'post'] | order(_createdAt desc) {
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

export default async function BlogPage() {
    const posts: Post[] = await getPosts();

    console.log("posts: ", posts)

    return (
        <div className="flex flex-col min-h-screen text-black bg-white dark:text-white dark:bg-black">
            {/* Navbar */}
            <Navbar removeTransparency={true} />

            {/* Main Content */}
            <main className="w-full max-w-7xl mx-auto px-5 py-10 flex-grow">
                <div className="text-2xl font-bold mb-6 pt-20">Latest Posts</div>
                <div className="grid gap-6 auto-rows-auto grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                    {posts.map((post) => {
                        const createdDate = new Date(post._createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        });

                        return (
                            <Link href={`/blog/${post.slug.current}`} key={post._id}>
                                <Card
                                    key={post._id}
                                    className="cursor-pointer relative overflow-hidden group rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-800 transition duration-300 ease-in-out"
                                >
                                    {/* Image or Fallback */}
                                    {post.mainImage?.asset?.url ? (
                                        <div className="w-full h-52 relative overflow-hidden rounded-t-lg">
                                            <Image
                                                src={post.mainImage.asset.url}
                                                alt={post.title || "Post Image"}
                                                layout="fill"
                                                objectFit="cover"
                                                className="transition duration-300 ease-in-out group-hover:opacity-85"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-52 overflow-hidden rounded-t-lg bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                                            No Image Available
                                        </div>
                                    )}
                                    {/* Content */}
                                    <div className="w-full flex flex-row items-start justify-between px-5 pt-5 pb-4">
                                        <div className="text-base line-clamp-2 h-12 font-medium text-black dark:text-white !leading-relaxed pr-5">
                                            {post.title}
                                        </div>
                                        <ArrowUpRight className="flex-shrink-0 size-6 text-black dark:text-white" />
                                    </div>
                                    <div className="text-sm font-base px-5 pb-5 text-black/60 dark:text-white/70 !leading-relaxed">
                                        {createdDate}
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
