import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
    name: string;
    href: string;
    external?: boolean;
}

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems: NavItem[] = [
        { name: 'Projects', href: '/projects' },
        { name: 'Stone Library', href: '/stone-library' },
        { name: 'Our Story', href: '/our-story' },
        { name: 'Articles', href: '/articles' },
        { name: 'Products', href: '/products' },
        { name: 'Contact Us', href: 'mailto:info@urblo.com.au', external: true },
    ];

    function renderNavItem(item: NavItem, className: string) {
        if (item.external) {
            return (
                <a key={item.name} href={item.href} className={className}>
                    {item.name}
                </a>
            );
        }

        return (
            <Link key={item.name} to={item.href} className={className}>
                {item.name}
            </Link>
        );
    }

    return (
        <header className="relative z-50 bg-black">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <Link to="/">
                    <img
                        src="https://urblo.com.au/wp-content/uploads/2024/12/logo.png"
                        alt="Urblo logo"
                        className="h-10 w-auto"
                    />
                </Link>

                <nav className="hidden space-x-6 text-sm font-medium text-white md:flex">
                    {navItems.map((item) =>
                        renderNavItem(item, 'hover:text-gray-300 transition'),
                    )}
                </nav>

                <div className="md:hidden">
                    <button type="button" onClick={() => setMenuOpen(!menuOpen)}>
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

            {menuOpen && (
                <div className="space-y-3 bg-black bg-opacity-90 px-4 pb-4 text-center text-white md:hidden">
                    {navItems.map((item) => {
                        if (item.external) {
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="block text-lg font-medium hover:text-gray-300"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.name}
                                </a>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="block text-lg font-medium hover:text-gray-300"
                                onClick={() => setMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
