import { Link } from "react-router-dom";

export interface ProjectMeta {
    slug: string;
    title: string;
    location: string;
    date: string;
    cover: string;
}

export default function ProjectCard({ slug, title, location, date, cover }: ProjectMeta) {
    return (
        <Link
            to={`/projects/${slug}`}
            className="group relative block w-full overflow-hidden"
            style={{ aspectRatio: "379 / 600" }}
        >
            {/* 背景图 */}
            <img
                src={cover}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* 信息白框（响应式显隐 + 自适应尺寸） */}
            <div
                className="absolute bottom-0 right-0 w-[90%] max-w-[305px] h-[72px] sm:h-[86.5px] bg-white transition-opacity duration-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
                <div className="relative h-full w-full p-4 flex flex-col justify-between">
                    {/* 顶部行 */}
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                        <img
                            src="https://urblo.com.au/wp-content/plugins/vxd-elements/assets/images/arrow-black-slanted-upwards.svg"
                            alt=""
                            className="h-4 w-4"
                        />
                    </div>

                    {/* 底部信息 */}
                    <p className="text-xs text-gray-500">
                        {location}, {date}
                    </p>
                </div>
            </div>
        </Link>
    );
}