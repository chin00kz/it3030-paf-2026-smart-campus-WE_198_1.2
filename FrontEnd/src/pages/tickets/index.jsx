import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getResources } from "@/api/resourceApi"
import {
  addTicketComment,
  assignTechnician,
  createTicket,
  deleteTicketComment,
  getApiError,
  getTickets,
  updateTicketComment,
  updateTicketStatus,
} from "@/api/ticketApi"
import { userService } from "@/lib/api-client"

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MANAGER"]

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [resources, setResources] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [newComment, setNewComment] = useState({})
  const [createForm, setCreateForm] = useState({
    resourceId: "",
    category: "",
    description: "",
    priority: "MEDIUM",
    contactDetails: "",
    attachments: [],
  })

  const isAdminLike = ADMIN_ROLES.includes(user?.role)
  const isTechnician = user?.role === "TECHNICIAN"
  const isReporter = user?.role === "USER"

  const statusOptions = useMemo(() => {
    if (isAdminLike) return ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]
    if (isTechnician) return ["IN_PROGRESS", "RESOLVED"]
    return ["CLOSED"]
  }, [isAdminLike, isTechnician])

  const loadTickets = async () => {
    setLoading(true)
    setError("")
    try {
      const params = {}
      if (isReporter) params.reportedByEmail = user.email
      if (isTechnician) params.technicianEmail = user.email
      const data = await getTickets(params)
      setTickets(data)
    } catch (e) {
      setError(getApiError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.email) return
    loadTickets()
  }, [user?.email, user?.role])

  useEffect(() => {
    const loadSupportingData = async () => {
      try {
        if (isReporter) {
          const resourcePage = await getResources({}, 0, 100)
          setResources(resourcePage.content || [])
        }

        if (isAdminLike) {
          const users = await userService.getAllUsers()
          setTechnicians((users || []).filter((u) => u.role === "TECHNICIAN"))
        }
      } catch (e) {
        setError(getApiError(e))
      }
    }

    if (user?.email) {
      loadSupportingData()
    }
  }, [user?.email, user?.role, isReporter, isAdminLike])

  const onCreateTicket = async (e) => {
    e.preventDefault()
    if (!createForm.resourceId || !createForm.category || !createForm.description) {
      setError("Please fill resource, category, and description")
      return
    }

    if (createForm.attachments.length > 3) {
      setError("Only up to 3 image attachments are allowed")
      return
    }

    setSubmitting(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("resourceId", createForm.resourceId)
      formData.append("reportedByEmail", user.email)
      formData.append("category", createForm.category)
      formData.append("description", createForm.description)
      formData.append("priority", createForm.priority)
      formData.append("contactDetails", createForm.contactDetails)
      Array.from(createForm.attachments).forEach((file) => formData.append("attachments", file))

      await createTicket(formData)
      setCreateForm({
        resourceId: "",
        category: "",
        description: "",
        priority: "MEDIUM",
        contactDetails: "",
        attachments: [],
      })
      await loadTickets()
    } catch (e) {
      setError(getApiError(e))
    } finally {
      setSubmitting(false)
    }
  }

  const onAssign = async (ticketId, technicianId) => {
    if (!technicianId) return
    try {
      await assignTechnician(ticketId, {
        actorEmail: user.email,
        technicianId: Number(technicianId),
      })
      await loadTickets()
    } catch (e) {
      setError(getApiError(e))
    }
  }

  const onStatusChange = async (ticketId, nextStatus) => {
    const payload = {
      actorEmail: user.email,
      status: nextStatus,
    }

    if (nextStatus === "REJECTED") {
      const reason = window.prompt("Enter rejection reason")
      if (!reason) return
      payload.rejectionReason = reason
    }

    if (nextStatus === "RESOLVED" || nextStatus === "CLOSED") {
      const notes = window.prompt("Resolution notes (optional)")
      if (notes) payload.resolutionNotes = notes
    }

    try {
      await updateTicketStatus(ticketId, payload)
      await loadTickets()
    } catch (e) {
      setError(getApiError(e))
    }
  }

  const onAddComment = async (ticketId) => {
    const content = (newComment[ticketId] || "").trim()
    if (!content) return

    try {
      await addTicketComment(ticketId, { actorEmail: user.email, content })
      setNewComment((prev) => ({ ...prev, [ticketId]: "" }))
      await loadTickets()
    } catch (e) {
      setError(getApiError(e))
    }
  }

  const onEditComment = async (ticketId, comment) => {
    const content = window.prompt("Edit comment", comment.content)
    if (!content || !content.trim()) return

    try {
      await updateTicketComment(ticketId, comment.id, { actorEmail: user.email, content })
      await loadTickets()
    } catch (e) {
      setError(getApiError(e))
    }
  }

  const onDeleteComment = async (ticketId, commentId) => {
    if (!window.confirm("Delete this comment?")) return
    try {
      await deleteTicketComment(ticketId, commentId, user.email)
      await loadTickets()
    } catch (e) {
      setError(getApiError(e))
    }
  }

  const canModerateComment = (commentUserEmail) => {
    return commentUserEmail === user?.email || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Incident Tickets</h1>
        <button
          onClick={loadTickets}
          className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
          type="button"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isReporter && (
        <form onSubmit={onCreateTicket} className="rounded-xl border bg-card p-4 space-y-3">
          <h2 className="text-lg font-semibold">Create New Ticket</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={createForm.resourceId}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, resourceId: e.target.value }))}
              className="rounded-md border px-3 py-2"
              required
            >
              <option value="">Select resource</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.location || "N/A"})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Category (e.g. Electrical)"
              className="rounded-md border px-3 py-2"
              value={createForm.category}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
              required
            />
            <select
              value={createForm.priority}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, priority: e.target.value }))}
              className="rounded-md border px-3 py-2"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <input
              type="text"
              placeholder="Preferred contact details"
              className="rounded-md border px-3 py-2"
              value={createForm.contactDetails}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, contactDetails: e.target.value }))}
            />
          </div>
          <textarea
            placeholder="Describe the incident"
            className="w-full rounded-md border px-3 py-2"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            required
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(e) => setCreateForm((prev) => ({ ...prev, attachments: e.target.files || [] }))}
          />
          <button
            type="submit"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">No tickets found.</div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">#{ticket.id} {ticket.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.resourceName} • {ticket.resourceLocation || "No location"}
                  </p>
                  <p className="text-sm text-muted-foreground">Reporter: {ticket.reportedByName} ({ticket.reportedByEmail})</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border px-2 py-1">{ticket.priority}</span>
                  <span className="rounded-full border px-2 py-1">{ticket.status}</span>
                  {ticket.technicianName && (
                    <span className="rounded-full border px-2 py-1">Tech: {ticket.technicianName}</span>
                  )}
                </div>
              </div>

              <p className="text-sm">{ticket.description}</p>

              {!!ticket.attachments?.length && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Attachments</p>
                  <ul className="space-y-1">
                    {ticket.attachments.map((file) => (
                      <li key={file.id} className="text-muted-foreground">{file.fileName}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {isAdminLike && (
                  <select
                    defaultValue=""
                    onChange={(e) => onAssign(ticket.id, e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">Assign technician</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.email})
                      </option>
                    ))}
                  </select>
                )}

                <select
                  defaultValue=""
                  onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Change status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">Comments</p>
                {ticket.comments?.map((comment) => (
                  <div key={comment.id} className="rounded-md border p-2 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">
                      {comment.userName} ({comment.userEmail})
                    </p>
                    <p>{comment.content}</p>
                    {canModerateComment(comment.userEmail) && (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() => onEditComment(ticket.id, comment)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() => onDeleteComment(ticket.id, comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    placeholder="Add a comment"
                    value={newComment[ticket.id] || ""}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="rounded-md border px-3 py-2 text-sm"
                    onClick={() => onAddComment(ticket.id)}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
