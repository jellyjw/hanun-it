export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </nav>

      {/* Article content skeleton */}
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Back button */}
          <div className="mb-6 h-5 w-24 animate-pulse rounded bg-gray-200" />

          {/* Title */}
          <div className="mb-4 space-y-3">
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Meta info */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Thumbnail */}
          <div className="mb-8 aspect-video w-full animate-pulse rounded-lg bg-gray-200" />

          {/* Content lines */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-gray-100"
                style={{ width: `${85 + Math.random() * 15}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
