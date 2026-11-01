import GatepassClient from './GatepassClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <GatepassClient params={params} />;
}
