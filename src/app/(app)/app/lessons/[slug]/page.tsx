import { LessonPlayer } from "@/components/lessons/LessonPlayer";

export default async function LessonPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return <LessonPlayer slug={slug} />;
}
