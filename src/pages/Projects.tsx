import ProjectCard, {type ProjectMeta } from "../components/ProjectCard";

const projects: ProjectMeta[] = [
    {
        slug: "australian-catholic-university",
        title: "Australian Catholic University",
        location: "Victoria",
        date: "December 18, 2024",
        cover: "https://urblo.com.au/wp-content/uploads/2024/12/IMGP0028-scaled-1.jpg",
    },
    {
        slug: "moon-gate-woolley-street",
        title: "Moon Gate | Woolley Street",
        location: "ACT",
        date: "December 17, 2024",
        cover: "https://urblo.com.au/wp-content/uploads/2024/12/Moon-Garden-4-Web-Sized-Matthew-Sherren-Photography-1-1.jpg",
    },
    {
        slug: "west-side-place",
        title: "West Side Place",
        location: "Victoria",
        date: "December 16, 2024",
        cover: "https://urblo.com.au/wp-content/uploads/2024/12/P1090007-1-scaled-2.jpg",
    },
    {
        slug: "xavier-college",
        title: "Xavier College",
        location: "Victoria",
        date: "December 15, 2024",
        cover: "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-14.55.37-1.jpeg",
    },
    {
        slug: "artisan-park-yarrabend",
        title: "Artisan Park | YarraBend",
        location: "Victoria",
        date: "December 14, 2024",
        cover: "https://urblo.com.au/wp-content/uploads/2025/01/WhatsApp-Image-2024-12-18-at-13.19.23-scaled-1.png",
    },
];

export default function Projects() {
    return (
        <>
            {/* Intro */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-6xl space-y-6 px-4">
                    <h3 className="text-3xl font-semibold">Our recent projects</h3>
                    <p className="max-w-2xl text-gray-600">
                        Browse our portfolio of residential and commercial projects,
                        showcasing Urblo’s dedication to quality, design, and craftsmanship.
                        See how we create unique, functional spaces tailored to our
                        clients’ visions.
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((proj) => (
                            <ProjectCard key={proj.slug} {...proj} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
