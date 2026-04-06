export default function StudentDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 text-center items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, Student!</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        This is your student portal. Soon you will be able to manage your facilities, 
        book study rooms, and report incidents directly from here.
      </p>
      <div className="grid gap-4 mt-8 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:border-primary transition-colors cursor-pointer text-left">
          <h3 className="text-lg font-semibold">Facilities Catalogue</h3>
          <p className="text-sm text-muted-foreground mt-1">Browse and book available campus resources.</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:border-primary transition-colors cursor-pointer text-left">
          <h3 className="text-lg font-semibold">Report an Incident</h3>
          <p className="text-sm text-muted-foreground mt-1">Submit a ticket for technical or facility issues.</p>
        </div>
      </div>
    </div>
  )
}
