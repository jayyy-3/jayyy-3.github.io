import type { ProjectMaterialMap as ProjectMaterialMapData } from '../../data/projectData';
import ProjectHotspotImage from './ProjectHotspotImage';

interface ProjectMaterialMapProps {
  materialMap: ProjectMaterialMapData;
}

export default function ProjectMaterialMap({ materialMap }: ProjectMaterialMapProps) {
  return (
    <ProjectHotspotImage
      image={materialMap.image}
      imageAlt={materialMap.imageAlt}
      title={materialMap.title}
      intro={materialMap.intro}
      hotspots={materialMap.hotspots}
    />
  );
}
