import { Navigate, useParams } from "react-router-dom";
import { materialCategories } from "../data/materialData";
import ImageGallery from "../components/ImageGallery";
import PdfDownloadCard from "../components/PdfDownloadCard";
import EnquiryStrip from "../components/EnquiryStrip";

export default function MaterialDetailPage() {
    const { category = "", subcategory = "", slug = "" } = useParams();

    // Deep lookup: category > subcategory > item
    const cat = materialCategories.find((c) => c.slug === category);
    const sub = cat?.subCategories.find((s) => s.slug === subcategory);
    const item = sub?.items.find((i) => i.slug === slug);

    // Redirect to /materials if any path segment is invalid
    if (!cat || !sub || !item) return <Navigate to="/materials" replace />;

    return (
        <>
            {/* HERO SECTION with overlay and responsive height */}
            <header className="relative h-[50vh] sm:h-[60vh] min-h-[300px]">
                <img
                    src={item.hero || item.img}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager" // Only hero image loads eagerly
                />
                {/* Dark overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/30" />
            </header>

            {/* MAIN CONTENT */}
            <main className="relative z-10 bg-accent-white rounded-t-3xl pb-20 pt-14 -translate-y-10">
                <div className="mx-auto max-w-6xl px-4 lg:grid lg:grid-cols-12 lg:gap-x-8">
                    {/* TITLE & META INFO */}
                    <section className="lg:col-span-4 text-primary-90">
                        <h1 className="font-heading text-4.5xl leading-tight text-primary-100">
                            {item.name}
                        </h1>

                        {/* Finishes */}
                        {item.finishes && (
                            <ul className="mt-4 text-primary-80">
                                <li>
                                    <span className="font-medium">Finish / Edge:&nbsp;</span>
                                    {item.finishes.join(" • ")}
                                </li>
                            </ul>
                        )}

                        {/* Sizes */}
                        {item.sizes && (
                            <ul className="mt-1 text-primary-80">
                                <li>
                                    <span className="font-medium">Sizes:&nbsp;</span>
                                    {item.sizes.join(" • ")}
                                </li>
                            </ul>
                        )}

                        {/* Enquiry button for mobile screens */}
                        <div className="mt-8 lg:hidden">
                            <EnquiryStrip materialName={item.name} />
                        </div>
                    </section>

                    {/* IMAGE GALLERY */}
                    <section className="mt-10 lg:col-span-8 lg:mt-0">
                        <ImageGallery
                            hero={item.hero || item.img}
                            gallery={item.gallery}
                            name={item.name}
                        />
                    </section>
                </div>

                {/* DESCRIPTION SECTION (sanitized HTML) */}
                {item.description && (
                    <section className="prose prose-lg mx-auto mt-14 max-w-3xl px-4 text-primary-80">
                        <div dangerouslySetInnerHTML={{ __html: item.description }} />
                    </section>
                )}

                {/* PDF DOWNLOAD + ENQUIRY STRIP */}
                <section className="mx-auto mt-14 grid max-w-6xl gap-8 px-4 lg:grid-cols-12 lg:gap-x-8">
                    {/* PDF Download */}
                    {item.specsPdf && (
                        <div className="lg:col-span-4">
                            <PdfDownloadCard pdf={item.specsPdf} />
                        </div>
                    )}

                    {/* Enquiry CTA on large screens */}
                    <div className="lg:col-span-8 hidden lg:block">
                        <EnquiryStrip materialName={item.name} />
                    </div>
                </section>
            </main>
        </>
    );
}