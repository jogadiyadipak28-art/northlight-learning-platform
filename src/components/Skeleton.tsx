export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="course-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="course-card skeleton-card">
          <div className="skel skel-cover" />
          <div className="skel skel-line" />
          <div className="skel skel-line short" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      <p>{body}</p>
    </div>
  )
}
