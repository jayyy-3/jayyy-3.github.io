import { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    bgImage?: string;
}

export default function Header({ bgImage }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { name: 'Projects', href: '/projects' },
        { name: 'Materials', href: '/products' },
        { name: 'Our Story', href: '/our-story' },
        { name: 'Articles', href: '/articles' },
        { name: 'Sample Request', href: '/sample-request' },
        { name: 'Contact Us', href: '/contact' },
    ];

    return (
        <header className="relative z-50 bg-black">
            {/* 🔥 Background Video */}
            {/*{!bgImage && (*/}
            {/*    <video*/}
            {/*        autoPlay*/}
            {/*        muted*/}
            {/*        loop*/}
            {/*        playsInline*/}
            {/*        className="absolute top-0 left-0 w-full h-full object-cover object-top -z-10"*/}
            {/*    >*/}
            {/*        <source src="https://urblo.com.au/urblo/" type="video/mp4" />*/}
            {/*        Your browser does not support the video tag.*/}
            {/*    </video>*/}
            {/*)}*/}

            {/*/!* 🖼️ Image Fallback *!/*/}
            {/*{bgImage && (*/}
            {/*    <div*/}
            {/*        className="absolute top-0 left-0 w-full h-full object-cover object-top -z-10"*/}
            {/*        style={{*/}
            {/*            backgroundImage: `url(${bgImage})`,*/}
            {/*            backgroundSize: 'cover',*/}
            {/*            backgroundPosition: 'top',*/}
            {/*            backgroundRepeat: 'no-repeat',*/}
            {/*        }}*/}
            {/*    />*/}
            {/*)}*/}
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/">
                    <img
                        src="https://urblo.com.au/wp-content/uploads/2024/12/logo.png"
                        alt="Logo"
                        className="h-10 w-auto"
                    />
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden md:flex space-x-6 text-white text-sm font-medium">
                    {navItems.map((item) => (
                        <Link key={item.name} to={item.href} className="hover:text-gray-300">
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Hamburger for Mobile */}
                <div className="md:hidden">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? (
                            <img
                                src="https://urblo.com.au/wp-content/uploads/2024/12/Group-228.svg"
                                alt="Close"
                                className="h-6"
                            />
                        ) : (
                            <img
                                src="https://urblo.com.au/wp-content/uploads/2024/12/hamburger.svg"
                                alt="Menu"
                                className="h-6"
                            />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-black bg-opacity-90 text-white px-4 pb-4 space-y-3 text-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className="block text-lg font-medium hover:text-gray-300"
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
