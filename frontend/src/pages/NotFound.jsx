import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="px-5 sm:px-10 py-24 text-center">
      <div className="eyebrow mb-3">Error 404</div>
      <h1 className="text-5xl font-bold tracking-tight">This road doesn't go anywhere</h1>
      <p className="mt-4 text-black/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-dark mt-8">Back to home</Link>
    </div>
  );
}
