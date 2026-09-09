export function Loading({ label = 'Загрузка…' }: { label?: string }) {
  return <p role="status">{label}</p>;
}
