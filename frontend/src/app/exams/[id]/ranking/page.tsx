import ExamRankingClient from './ExamRankingClient';

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1) }));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ExamRankingClient params={params} />;
}
