import Header from '../components/Header';
import Footer from '../components/Footer';
import * as React from "react";

interface Props {
    children: React.ReactNode;
    bgImage?: string;
}

export default function DefaultLayout({ children }: Props) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
