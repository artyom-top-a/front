import { client } from "@/sanity/lib/client";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import Image from "next/image";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import CTA from "@/components/landing/cta";

interface Post {
    title: string;
    body: PortableTextBlock[]; 
    mainImage?: {
        asset: {
            url: string;
        };
    };
    _createdAt: string;
}

async function getPost(slug: string): Promise<Post | null> {
    const query = `
        *[_type == 'post' && slug.current == $slug][0] {
            title,
            body,
            mainImage {
                asset->{
                    url
                }
            },
            _createdAt
        }
    `;
    const post = await client.fetch(query, { slug });
    return post;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);

    if (!post) {
        return {
            title: "Post Not Found - GStudy Blog",
            description: "The post you're looking for doesn't exist.",
            openGraph: {
                title: "Post Not Found - GStudy Blog",
                description: "The post you're looking for doesn't exist.",
                type: "website",
                url: `https://gstudy.pro/blog/${params.slug}`,
            },
            keywords: [
                "study tools",
                "AI flashcards",
                "PDF summarizer",
                "YouTube notes",
                "student productivity",
                "online learning",
                "GStudy app"
              ],
        };
    }

    const createdDate = new Date(post._createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return {
        title: `${post.title} - GStudy Blog`,
        description: `Read "${post.title}" on GGStudy Blog. Published on ${createdDate}.`,
        openGraph: {
            title: `${post.title} - GGStudy Blog`,
            description: `Explore "${post.title}" and more on GStudy Blog. Published on ${createdDate}.`,
            type: "article",
            url: `https://gstudy.pro/blog/${params.slug}`,
            images: post.mainImage?.asset?.url
                ? [
                      {
                          url: post.mainImage.asset.url,
                          alt: post.title,
                      },
                  ]
                : undefined,
        },
        twitter: {
            card: post.mainImage?.asset?.url ? "summary_large_image" : "summary",
            title: `${post.title} - GStudy Blog`,
            description: `Read "${post.title}" on GStudy Blog. Published on ${createdDate}.`,
            images: post.mainImage?.asset?.url ? [post.mainImage.asset.url] : undefined,
        },
    };
}

export default async function ArticlePage({ params: { slug } }: { params: { slug: string } }) {
    const post = await getPost(slug);

    if (!post) {
        return (
            <div className="flex flex-col min-h-screen text-black bg-white dark:text-white dark:bg-black">
                <Navbar removeTransparency={true} />
                <main className="w-full max-w-4xl mx-auto px-5 py-10 flex-grow text-center">
                    <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                    <p className="text-gray-500">The post you&apos;re looking for doesn&apos;t exist.</p>
                </main>
                <Footer />
            </div>
        );
    }

    const createdDate = new Date(post._createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex flex-col min-h-screen text-black bg-white dark:text-white dark:bg-black">
            {/* Navbar */}
            <Navbar />

            {/* Article Content */}
            <main className="w-full max-w-3xl mx-auto px-5 pt-10 flex-grow">
                <article>
                    <header>
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold !leading-normal mb-4 pt-16">{post.title}</div>
                        <div className="text-sm md:text-[15px] text-gray-500 mb-6">Published on {createdDate}</div>
                    </header>
                    {post.mainImage?.asset?.url && (
                        <div className="w-full mb-6">
                            <Image
                                src={post.mainImage.asset.url}
                                alt={post.title || "Post Image"}
                                width={768} // Optional: specify a reasonable width
                                height={0}
                                className="rounded-lg max-h-[500px]"
                            />
                        </div>
                    )}

                    <div className="prose dark:prose-invert">
                        <PortableText value={post.body} />
                    </div>
                </article>

                <CTA />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
