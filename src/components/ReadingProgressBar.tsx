//  src/components/ReadingProgressBar.tsx
import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const total = document.body.scrollHeight - window.innerHeight;
            const current = window.scrollY;
            setProgress(total ? current / total : 0);
        };

        update();
        window.addEventListener("scroll", update);
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <div
            className="fixed top-0 left-0 z-50 h-1 bg-emerald-500"
            style={{ width: `${progress * 100}%` }}
        />
    );
}