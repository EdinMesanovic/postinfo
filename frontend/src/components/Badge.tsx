export default function Badge({ status }: { status: string }) {
  const cls =
    status === 'CREATED_IN_POST' ? 'bg-gray' :
    status === 'AT_LDC' ? 'bg-blue' :
    status === 'PICKED_BY_DRIVER' ? 'bg-green' :
    'bg-yellow';
  return <span className={`badge ${cls}`}>{status}</span>;
}
