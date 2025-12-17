'use client'

export default function Error({ error }: { error: Error }) {
  console.error('[ERROR] Global error boundary:', error.message);
  return <div>Something went wrong</div>;
}
