interface Props {
    materialName: string;
}

export default function EnquiryStrip({ materialName }: Props) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-chartreuse-120 p-6">
            <p className="font-copy text-lg text-primary-100">
                Want to know more about <span className="font-semibold">{materialName}</span>?
            </p>
            <a
                href="/en-au/contact-us"
                className="inline-flex items-center border border-primary-100 px-4 py-2 font-copy text-primary-100 hover:bg-white"
            >
                Enquire
                <svg
                    className="ml-2 h-4 w-4"
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path d="M6 12.5L10 8.5L6 4.5" stroke="currentColor" />
                    <path d="M2 8H10" stroke="currentColor" />
                </svg>
            </a>
        </div>
    );
}
