export default function Footer() {
    return (
        <footer className="bg-black text-white px-6 py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Column 1 - Description & Social */}
                <div>
                    <div className="text-lg font-light mb-4">
                        Devoted to support ethical and significant projects every step of the way<span>.</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                        <li><a href="#" target="_blank">Facebook</a></li>
                        <li><a href="https://www.instagram.com/urb.lo?igsh=MThyZ3g1NnoyMXc0cg%3D%3D&utm_source=qr" target="_blank">Instagram</a></li>
                        <li><a href="https://au.linkedin.com/company/urblo" target="_blank">LinkedIn</a></li>
                        <li><a href="#" target="_blank">YouTube</a></li>
                    </ul>
                </div>

                {/* Column 2 - Address & Contact */}
                <div>
                    <p className="text-sm mb-2">5 Hamilton St,<br />Oakleigh VIC 3166</p>
                    <p className="text-sm mb-2">
                        <a href="mailto:info@urblo.com.au">info@urblo.com.au</a>
                    </p>
                    <p className="text-sm">1300 1URBLO</p>
                </div>

                {/* Column 3 - Menu & Copyright */}
                <div>
                    <ul className="text-sm mb-4 space-y-1">
                        <li><a href="/sample-request">Sample Request</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                    </ul>
                    <div className="text-xs text-gray-400">
                        <p>All rights reserved</p>
                        <p>© Copyright 2025</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
