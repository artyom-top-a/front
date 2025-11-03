import Link from "next/link";


const Footer = () => {
    return (
        <footer className="w-full mt-28 py-10 items-center justify-between sm:flex text-gray-500">
            <div className="w-full flex flex-col md:flex-row text-[15px] md:text-base items-center justify-between px-6 md:px-24">
                <div className="flex-shrink-0">© 2025 GStudy. All rights reserved.</div>
                <ul className="flex flex-row items-center gap-8 mt-6 text-[15px] md:text-base sm:mt-0">
                    <li className="list-none">
                        <a href="https://discord.gg/7rPhBMteaD" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors duration-300">Discord</a>
                    </li>
                    <li className="list-none">
                        <Link href="/blog" className="hover:text-black transition-colors duration-300">Blog</Link>
                    </li>
                </ul>
            </div>
        </footer>
    )
}

export default Footer;