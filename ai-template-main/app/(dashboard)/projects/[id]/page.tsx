import { Suspense } from "react";
import ProjectContent from "./project-content";

// Static export
export function generateStaticParams() {
  return [
    { id: "research-analysis" },
    { id: "web-search" },
    { id: "knowledge-base" },
    { id: "api-documentation" },
  ];
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          Loading...
        </div>
      }
    >
      <ProjectContent id={id} />
    </Suspense>
  );
}
