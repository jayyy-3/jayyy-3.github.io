interface Props {
    pdf: string;
}

export default function PdfDownloadCard({ pdf }: Props) {
    const fileName = pdf.split("/").pop() || "Specs.pdf";
    return (
        <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-primary-30 bg-white p-6 shadow hover:shadow-lg"
        >
            <h3 className="font-heading text-xl text-primary-100">Specification&nbsp;Sheet</h3>
            <p className="mt-2 text-primary-70">{fileName}</p>
            <div className="mt-4 inline-flex items-center font-copy text-sm text-primary-100">
                Download
                <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path d="M6 12.5L10 8.5L6 4.5" stroke="currentColor" />
                    <path d="M2 8H10" stroke="currentColor" />
                </svg>
            </div>
        </a>
    );
}
