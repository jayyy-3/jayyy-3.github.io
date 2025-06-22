import Header from '../components/Header';
import Footer from '../components/Footer';
import * as React from "react";

interface Props {
    children: React.ReactNode;
    bgImage?: string;
}

export default function DefaultLayout({ children }: Props) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
        </>
    );
}
