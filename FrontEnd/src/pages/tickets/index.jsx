import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getResources } from "@/api/resourceApi"
import {
  addTicketComment,
  assignTechnician,
  buildTicketAttachmentDownloadUrl,
  createTicket,
  deleteTicket,
  deleteTicketComment,
  getActiveTicketsForResource,
  getApiError,
  getTickets,
  updateTicketComment,
  updateTicketStatus,
} from "@/api/ticketApi"
import { userService } from "@/lib/api-client"
import { AlertCircle, Loader, MapPin, Ticket as TicketIcon, Wrench, MessageSquare, Send, Trash2, Edit2, Paperclip, Download, User, Info, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [duplicateTickets, setDuplicateTickets] = useState([])
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
  const canDownloadAttachments = isAdminLike || isTechnician

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchPriority && matchStatus;
    });
  }, [tickets, priorityFilter, statusFilter]);

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

  useEffect(() => {
    if (!createForm.resourceId) {
      setDuplicateTickets([])
      return
    }
    const checkDuplicates = async () => {
      try {
        const active = await getActiveTicketsForResource(createForm.resourceId)
        setDuplicateTickets(active)
      } catch (e) {
        console.error("Failed to fetch duplicate tickets", e)
      }
    }
    checkDuplicates()
  }, [createForm.resourceId])

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

    const hasInvalidAttachment = createForm.attachments.some((file) => !file.type.startsWith("image/"))
    if (hasInvalidAttachment) {
      setError("Only image attachments are allowed")
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

  const onAttachmentChange = (e) => {
    const files = Array.from(e.target.files || [])

    if (files.length > 3) {
      setError("Only up to 3 image attachments are allowed")
      setCreateForm((prev) => ({ ...prev, attachments: [] }))
      e.target.value = ""
      return
    }

    const hasInvalidAttachment = files.some((file) => !file.type.startsWith("image/"))
    if (hasInvalidAttachment) {
      setError("Only image attachments are allowed")
      setCreateForm((prev) => ({ ...prev, attachments: [] }))
      e.target.value = ""
      return
    }

    setError("")
    setCreateForm((prev) => ({ ...prev, attachments: files }))
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

  const onDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to permanently delete this ticket?")) return
    try {
      await deleteTicket(ticketId, user.email)
      await loadTickets()
    } catch (e) {
      setError(getApiError(e))
    }
  }

  const canModerateComment = (commentUserEmail) => {
    return commentUserEmail === user?.email || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  }

  const onExportReport = () => {
    if (filteredTickets.length === 0) {
      setError("No tickets to export in current view.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Smart Campus - Incident Tickets Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on: ${date}`, 14, 30);
    doc.text(`Filters - Priority: ${priorityFilter} | Status: ${statusFilter}`, 14, 35);
    doc.text(`Total Tickets: ${filteredTickets.length}`, 14, 40);

    const headers = [["ID", "Category", "Resource", "Priority", "Status", "Reporter", "Technician"]];

    const rows = filteredTickets.map(ticket => [
      `#${ticket.id}`,
      ticket.category || '-',
      ticket.resourceName || '-',
      ticket.priority,
      ticket.status,
      ticket.reportedByName || '-',
      ticket.technicianName || 'Unassigned'
    ]);

    autoTable(doc, {
      startY: 45,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`campus_tickets_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'text-amber-500 bg-amber-50 border-amber-200',
      'IN_PROGRESS': 'text-blue-500 bg-blue-50 border-blue-200',
      'RESOLVED': 'text-emerald-500 bg-emerald-50 border-emerald-200',
      'CLOSED': 'text-slate-500 bg-slate-50 border-slate-200',
      'REJECTED': 'text-red-500 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-slate-500 bg-slate-50 border-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': 'text-emerald-500',
      'MEDIUM': 'text-amber-500',
      'HIGH': 'text-orange-500',
      'CRITICAL': 'text-red-500'
    };
    return colors[priority] || 'text-slate-500';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 pb-20">
      {/* Premium Mesh Hero Section */}
      <div className="mesh-gradient h-48 w-full flex flex-col items-center justify-center relative overflow-hidden px-6 rounded-b-[3rem] shadow-xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        <div className="relative z-10 text-center space-y-2 mt-4">
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl">
            Campus <span className="text-emerald-300">Incident Tickets</span>
          </h1>
          <p className="text-white/90 text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
            Report, track, and resolve facility and equipment issues in our smart ecosystem.
          </p>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-6 relative z-20 space-y-8 ${isReporter ? '-mt-16' : '-mt-2'}`}>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-red-500 p-2 rounded-xl">
              <AlertCircle className="text-white" size={20} />
            </div>
            <p className="text-sm font-bold text-red-900">{error}</p>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600 font-black text-xl px-2">×</button>
          </div>
        )}

        {isReporter && (
          <div className="glass-morphism rounded-[2.5rem] p-8 transition-all hover:shadow-2xl border-white/60 bg-white/80 relative z-30">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mb-6">
              <Wrench className="text-blue-500" /> Report New Incident
            </h2>
            <form onSubmit={onCreateTicket} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Resource</label>
                  <select
                    value={createForm.resourceId}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, resourceId: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                    required
                  >
                    <option value="">Select resource...</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} ({resource.location || "N/A"})
                      </option>
                    ))}
                  </select>
                  {duplicateTickets.length > 0 && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Similar Issues Exist</span>
                      </div>
                      <p className="text-xs font-medium text-amber-800">
                        There {duplicateTickets.length === 1 ? "is" : "are"} currently {duplicateTickets.length} active ticket(s) for this resource. Consider checking them before submitting a new one.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {duplicateTickets.slice(0, 3).map(dt => (
                          <span key={dt.id} className="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-bold uppercase tracking-wide truncate max-w-[150px]">
                            #{dt.id} {dt.category}
                          </span>
                        ))}
                        {duplicateTickets.length > 3 && <span className="text-[9px] text-amber-600 font-bold self-center">+{duplicateTickets.length - 3} more</span>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Incident Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Electrical, Plumbing, Network"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                    value={createForm.category}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Priority Level</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Details (Optional)</label>
                  <input
                    type="text"
                    placeholder="Preferred contact number or email"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                    value={createForm.contactDetails}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, contactDetails: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Incident Description</label>
                <textarea
                  placeholder="Provide detailed information about the issue..."
                  className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner min-h-[120px]"
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Image Attachments (Max 3)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={onAttachmentChange}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  disabled={submitting}
                >
                  {submitting ? <Loader className="animate-spin" size={16} /> : <TicketIcon size={16} />}
                  {submitting ? "Submitting Sequence..." : "Deploy Ticket"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Bar */}
        <div className={`flex items-center justify-between ${isReporter ? 'mt-8' : 'mt-4'} mb-3`}>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FileText className="text-blue-500" /> Active Tickets Registry
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-sm bg-white/50 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-sm bg-white/50 outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <button
              onClick={loadTickets}
              className="px-6 py-3 rounded-xl border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm bg-white/50"
              type="button"
            >
              Refresh Registry
            </button>
            <button
              onClick={onExportReport}
              className="px-6 py-3 rounded-xl border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm bg-white/50 flex items-center gap-2"
              type="button"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={32} />
              </div>
              <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Synchronizing Tickets...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-32 glass-morphism rounded-[3rem] border-dashed border-2 border-slate-200">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <p className="text-slate-800 font-black text-2xl uppercase tracking-tight">No Active Tickets</p>
              <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto">
                {tickets.length > 0 ? "No tickets match the selected filters." : "The system is fully operational. All reported incidents have been resolved."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col">

                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-blue-600 uppercase tracking-widest">#{ticket.id}</span>
                        <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight uppercase">{ticket.category}</h3>
                      </div>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-500" /> {ticket.resourceName} • {ticket.resourceLocation || "No location"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                        {(ticket.reportedByEmail === user?.email || isAdminLike) && (
                          <button
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
                            title="Delete Ticket"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                        <AlertTriangle size={12} /> {ticket.priority} Priority
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-6 flex-1">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Description</p>
                      <p className="text-sm font-medium text-slate-700 bg-slate-50 rounded-2xl p-4 shadow-inner border border-slate-100 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported By</p>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><User size={12} /></div>
                          <span className="truncate">{ticket.reportedByName}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician</p>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Wrench size={12} /></div>
                          <span className="truncate">{ticket.technicianName || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    {!!ticket.attachments?.length && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments</p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map((file) => (
                            <div key={file.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                              <Paperclip size={14} className="text-slate-400" />
                              {canDownloadAttachments ? (
                                <a
                                  href={buildTicketAttachmentDownloadUrl(ticket.id, file.id, user.email)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors truncate max-w-[150px] flex items-center gap-1"
                                >
                                  {file.fileName} <Download size={12} />
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-slate-500 truncate max-w-[150px]">{file.fileName}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Management Actions */}
                  {(isAdminLike || isTechnician) && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-3">
                      {isAdminLike && (
                        <select
                          value=""
                          onChange={(e) => onAssign(ticket.id, e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                          <option value="" disabled>Assign Technician...</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <select
                        value=""
                        onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="" disabled>Update Status...</option>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <MessageSquare size={14} /> Communication Log
                    </p>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-4">
                      {ticket.comments?.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-xs font-bold text-slate-400">No communications recorded yet.</p>
                        </div>
                      ) : (
                        ticket.comments?.map((comment) => (
                          <div key={comment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <User size={12} className="text-blue-500" /> {comment.userName}
                              </p>
                              {canModerateComment(comment.userEmail) && (
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => onEditComment(ticket.id, comment)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 size={12} />
                                  </button>
                                  <button onClick={() => onDeleteComment(ticket.id, comment.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                        placeholder="Add a new transmission..."
                        value={newComment[ticket.id] || ""}
                        onChange={(e) => setNewComment((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && onAddComment(ticket.id)}
                      />
                      <button
                        type="button"
                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50"
                        onClick={() => onAddComment(ticket.id)}
                        disabled={!newComment[ticket.id]?.trim()}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
