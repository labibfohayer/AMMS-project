import ExamDetailClient from './ExamDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1) }));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ExamDetailClient params={params} />;
}
