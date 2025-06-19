import { useEffect, useState } from 'react';

export default function RespectPopup() {
    const [visible, setVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('seenPopup')) {
            setShouldRender(true);
            setTimeout(() => setVisible(true), 50);
            // localStorage.setItem('seenPopup', 'true');

            setTimeout(() => {
                setVisible(false);
                setTimeout(() => setShouldRender(false), 700);
            }, 3000);
        }
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => setShouldRender(false), 700);
    };

    if (!shouldRender) return null;

    return (
        <div className={`fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 pointer-events-none
        transition-opacity duration-700 ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-[80vw] sm:max-w-[1200px] bg-black/40
            text-white text-[14px] leading-[1.4] font-light px-6 py-10 shadow-md text-center">
                <p>
                    We acknowledge and respect Aboriginal and Torres Strait Islander Peoples across Australia as the Traditional Custodians of the lands, waters, seas and skies. We recognize their unique ability to care for Country and their deep spiritual connection with Country. We honor Elders past, present and emerging, whose knowledge and wisdom will ensure the continuation of Aboriginal and Torres Strait Islander cultures, and the values which uphold them.
                </p>
                <button
                    aria-label="Close"
                    className="absolute top-2 right-4 text-white text-xl leading-none font-light pointer-events-auto"
                    onClick={handleClose}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
