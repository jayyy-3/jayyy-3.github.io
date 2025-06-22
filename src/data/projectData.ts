export interface ProjectData {
    slug: string;
    name: string;
    images: string[];
    details: Record<string, string | string[]>;
}

export const projects: ProjectData[] = [
    {
        slug: "australian-catholic-university",
        name: "Australian Catholic University",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.47.48.jpeg",
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.47.49.jpeg",
        ],
        details: {
            Stone: "Bluestone",
            Finish: "Sawn",
            Quantity: "17 linear metres",
            "Carbon Offset": "Not available",
            "Landscape Architect": "Aspect Studio",
            Contractor: "Living Landscapes",
            Date: "May 2023 (completed)",
            Address: "115B Victoria Parade, Fitzroy, VIC 3065",
        },
    },
    {
        slug: "west-side-place",
        name: "West Side Place",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.30.49-scaled.jpeg",
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-15.30.57-scaled.jpeg",
        ],
        details: {
            Stone: [
                "Bluestone (various tones)",
                "Granite (various tones)",
            ],
            Finish: "Sawn · Split · Polished · Flamed",
            Quantity: "500 linear metres",
            "Carbon Offset": "Not available",
            "Landscape Architect": "Rush Wright Associates",
            Contractor: "Not available",
            Date: "2023 (completed)",
            Address: "250 Spencer St, Melbourne, VIC 3000",
        },
    },
    {
        slug: "xavier-college",
        name: "Xavier College",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-16.00.24-1-scaled.jpeg",
            "https://urblo.com.au/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-18-at-16.00.24-scaled.jpeg",
        ],
        details: {
            Stone: "Sandstone",
            Finish: "Sparrow Peck",
            Quantity: "12 linear metres",
            "Carbon Offset": "Not available",
            "Landscape Architect": "Openwork Pty Ltd",
            Contractor: "Delta Group",
            Date: "2023 (completed)",
            Address: "135 Barkers Rd, Kew, VIC 3101",
        },
    },
    {
        slug: "artisan-park-yarrabend",
        name: "Artisan Park | YarraBend",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/IMG_3557-1-scaled.jpg",
            "https://urblo.com.au/wp-content/uploads/2024/12/DJI_0212-scaled-1.png",
        ],
        details: {
            Stone: "New Grey",
            Finish: "Flamed",
            Quantity: "115 linear metres",
            "Carbon Offset": "Yes",
            "Landscape Architect": "Aspect Studio",
            Contractor: "Living Landscapes",
            Date: "April 2024 (completed)",
            Address: "55 Parkview Rd, Alphington, VIC 3078",
        },
    },
    {
        slug: "moon-gate-woolley-street",
        name: "Moon Gate | Woolley Street",
        images: [
            "https://urblo.com.au/wp-content/uploads/2024/12/Moon-Garden-4-Web-Sized-Matthew-Sherren-Photography.jpg",
            "https://urblo.com.au/wp-content/uploads/2024/12/Moon-Garden-9-Web-Sized-Matthew-Sherren-Photography.jpg",
        ],
        details: {
            Stone: ["New Grey", "Angola Black (granite)"],
            Finish: "Polished",
            Quantity: "5 Units",
            "Carbon Offset": "Yes",
            "Landscape Architect": "Aecom",
            Contractor: "Complex Co.",
            Date: "2023",
            Address: "Woolley Street, Dickson, ACT 2602",
        },
    }
];