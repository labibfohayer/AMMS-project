import StudentIdCardClient from './StudentIdCardClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <StudentIdCardClient params={params} />;
}
