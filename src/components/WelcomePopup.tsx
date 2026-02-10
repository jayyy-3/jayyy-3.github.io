import { useEffect, useRef, useState } from 'react';

const SHOW_DELAY_MS = 50;
const AUTO_HIDE_DELAY_MS = 3000;
const UNMOUNT_DELAY_MS = 700;

export default function WelcomePopup() {
    const [visible, setVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const showTimerRef = useRef<number | null>(null);
    const autoHideTimerRef = useRef<number | null>(null);
    const unmountTimerRef = useRef<number | null>(null);

    function clearTimer(ref: { current: number | null }) {
        if (ref.current !== null) {
            window.clearTimeout(ref.current);
            ref.current = null;
        }
    }

    useEffect(() => {
        if (localStorage.getItem('seenPopup')) {
            return;
        }

        localStorage.setItem('seenPopup', 'true');
        setShouldRender(true);

        showTimerRef.current = window.setTimeout(
            () => setVisible(true),
            SHOW_DELAY_MS,
        );

        autoHideTimerRef.current = window.setTimeout(() => {
            setVisible(false);
            clearTimer(unmountTimerRef);
            unmountTimerRef.current = window.setTimeout(
                () => setShouldRender(false),
                UNMOUNT_DELAY_MS,
            );
        }, AUTO_HIDE_DELAY_MS);

        return () => {
            clearTimer(showTimerRef);
            clearTimer(autoHideTimerRef);
            clearTimer(unmountTimerRef);
        };
    }, []);

    const handleClose = () => {
        clearTimer(showTimerRef);
        clearTimer(autoHideTimerRef);
        setVisible(false);
        clearTimer(unmountTimerRef);
        unmountTimerRef.current = window.setTimeout(
            () => setShouldRender(false),
            UNMOUNT_DELAY_MS,
        );
    };

    if (!shouldRender) {
        return null;
    }

    return (
        <div
            className={`fixed top-[20vh] left-1/2 z-50 -translate-x-1/2 pointer-events-none
        transition-opacity duration-700 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className="relative w-[80vw] bg-black/40 px-6 py-10 text-center text-[14px]
            font-light leading-[1.4] text-white shadow-md sm:max-w-[1200px]"
            >
                <p>
                    We acknowledge and respect Aboriginal and Torres Strait Islander Peoples across Australia as the Traditional Custodians of the lands, waters, seas and skies. We recognize their unique ability to care for Country and their deep spiritual connection with Country. We honor Elders past, present and emerging, whose knowledge and wisdom will ensure the continuation of Aboriginal and Torres Strait Islander cultures, and the values which uphold them.
                </p>
                <button
                    aria-label="Close"
                    className="absolute top-2 right-4 pointer-events-auto text-xl leading-none text-white font-light"
                    onClick={handleClose}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
