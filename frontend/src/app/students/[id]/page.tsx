import StudentDetailClient from './StudentDetailClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <StudentDetailClient params={params} />;
}
