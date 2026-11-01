import ExamDetailClient from './ExamDetailClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ExamDetailClient params={params} />;
}
