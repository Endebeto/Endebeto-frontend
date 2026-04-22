import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2, Clock, XCircle, Loader2,
  ShieldCheck, Search, MessageSquare, Star,
  FileText, ChevronRight, Home,
  RefreshCw, ArrowRight, Users, AlertCircle, Mail,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hostApplicationsService } from "@/services/hostApplications.service";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/errors";

/* ─── types ──────────────────────────────────────────── */
type AppStatus = "draft" | "submitted" | "pending" | "approved" | "rejected";

/* ─── helpers ────────────────────────────────────────── */
function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_ORDER: AppStatus[] = ["draft", "submitted", "pending", "approved"];

function getActiveStage(status: AppStatus) {
  if (status === "rejected") return 3;
  return STATUS_ORDER.indexOf(status);
}

/* ─── what's next steps ──────────────────────────────── */
const PROCESS_STEPS = [
  {
    n: "01", icon: Search,
    title: "Experience Audit",
    desc: "Our editorial experts review your background and story to ensure a deep connection to the heritage items you wish to list.",
  },
  {
    n: "02", icon: ShieldCheck,
    title: "Authenticity Check",
    desc: "We verify the source and provenance of your experience to ensure guests meet Highland Endebeto's heritage standards.",
  },
  {
    n: "03", icon: Users,
    title: "Virtual Interview",
    desc: "Depending on the complexity of your collection, we may schedule a brief 15-minute introductory call.",
  },
  {
    n: "04", icon: Star,
    title: "Final Approval",
    desc: "Once verified, you'll receive your 'Heritage Curator' host badge and full access to list and sell on our platform.",
  },
];

/* ─── component ──────────────────────────────────────── */
export default function HostApplicationStatus() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-host-application"],
    queryFn: async () => {
      const res = await hostApplicationsService.getMyApplication();
      return res.data.data.application;
    },
    retry: 1,
  });

  const reapplyMutation = useMutation({
    mutationFn: () => hostApplicationsService.reapply(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-host-application"] });
      toast.success("Application reset. You can now update and resubmit.");
      navigate("/host/apply");
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to reset application."));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-container-low dark:bg-zinc-950 font-body flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-surface-container-low dark:bg-zinc-950 font-body flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <p className="text-on-surface dark:text-white font-semibold">No application found.</p>
          <Link to="/host/apply" className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
            Start Application <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const status      = data.status as AppStatus;
  const activeStage = getActiveStage(status);

  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPending  = status === "pending" || status === "submitted";

  const submittedLabel  = fmtDate(data.submittedAt);
  const updatedLabel    = fmtDate(data.reviewedAt ?? data.submittedAt ?? data.createdAt);
  const rejectionReason = data.rejectionReason ?? "";

  const STAGES = [
    { key: "draft",     label: "Draft",          sub: "Completed" },
    { key: "submitted", label: "Submitted",       sub: submittedLabel },
    { key: "pending",   label: "Pending Review",  sub: "In Progress" },
    { key: "approved",  label: "Final Decision",  sub: isApproved ? "Approved" : isRejected ? "Rejected" : "Estimated 3–5 days" },
  ] as const;

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-zinc-950 font-body">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-20">

        {/* breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant dark:text-zinc-500 mb-8">
          <Link to="/" className="hover:text-primary dark:hover:text-green-400 transition-colors flex items-center gap-1">
            <Home className="h-3 w-3" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/become-host" className="hover:text-primary dark:hover:text-green-400 transition-colors">Become a Host</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-on-surface dark:text-white font-medium">Application Status</span>
        </div>

        {/* ── Hero heading ── */}
        <div className="mb-10">
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface dark:text-white leading-tight mb-3">
            Your Journey to<br />
            <span className="text-primary dark:text-green-400">Heritage Host</span>
          </h1>
          <p className="text-on-surface-variant dark:text-zinc-400 text-sm max-w-lg leading-relaxed">
            We are thrilled to review your application. Our team takes great pride in authenticating
            each host to maintain the highest standards of Ethiopian heritage representation.
          </p>
        </div>

        {/* ── Horizontal timeline ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/15 dark:border-zinc-800 shadow-sm px-6 md:px-10 py-7 mb-6">
          <div className="flex items-start">
            {STAGES.map((stage, i) => {
              const done    = i < activeStage;
              const active  = i === activeStage;
              const failed  = isRejected && i === STAGES.length - 1;
              const future  = i > activeStage;

              return (
                <div key={stage.key} className="flex items-start flex-1">
                  {/* step + label */}
                  <div className="flex flex-col items-center text-center flex-1 relative">
                    {/* circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2 z-10 relative ${
                      done    ? "bg-primary border-primary" :
                      active && !failed ? "bg-white dark:bg-zinc-900 border-primary ring-4 ring-primary/15" :
                      failed  ? "bg-error border-error" :
                                "bg-surface-container dark:bg-zinc-800 border-outline-variant/30 dark:border-zinc-600"
                    }`}>
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : active && failed ? (
                        <XCircle className="h-5 w-5 text-white" />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 text-on-surface-variant/40 dark:text-zinc-600" />
                      )}
                    </div>

                    {/* label */}
                    <p className={`text-xs font-bold leading-snug mb-0.5 ${
                      done || active ? "text-on-surface dark:text-white" : "text-on-surface-variant dark:text-zinc-500"
                    }`}>
                      {stage.label}
                    </p>

                    {/* date/sub */}
                    <p className={`text-[10px] font-medium ${
                      active  ? "text-primary dark:text-green-400 font-bold" :
                      done    ? "text-on-surface-variant dark:text-zinc-400" :
                                "text-on-surface-variant/60 dark:text-zinc-600"
                    }`}>
                      {stage.sub}
                    </p>

                    {/* active badge */}
                    {active && !failed && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary dark:text-green-400 bg-primary/8 dark:bg-primary/20 px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-primary dark:bg-green-400 animate-pulse" />
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* connector line */}
                  {i < STAGES.length - 1 && (
                    <div className={`h-0.5 flex-1 mt-5 mx-1 transition-colors duration-500 ${
                      i < activeStage ? "bg-primary" : "bg-outline-variant/25 dark:bg-zinc-700"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Two-column: Status card + Assistance card ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 mb-6">

          {/* Status card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/15 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isApproved ? "bg-emerald-100 dark:bg-emerald-900/40" :
                isRejected ? "bg-red-100 dark:bg-red-900/40" :
                isPending  ? "bg-primary/10 dark:bg-primary/20" :
                             "bg-surface-container dark:bg-zinc-800"
              }`}>
                {isApproved ? <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> :
                 isRejected ? <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" /> :
                 isPending  ? <Loader2 className="h-6 w-6 text-primary dark:text-green-400 animate-spin" /> :
                              <FileText className="h-6 w-6 text-on-surface-variant" />}
              </div>
              <div>
                <h2 className="font-headline font-bold text-base text-on-surface dark:text-white mb-0.5">
                  {isApproved ? "Application Approved!" :
                   isRejected ? "Application Not Approved" :
                   isPending  ? "Under Review" :
                                "Draft Saved"}
                </h2>
                <p className="text-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                  {isApproved ? "Congratulations! You're now an Endebeto Heritage Host. Start creating experiences." :
                   isRejected ? "Unfortunately your application was not approved. See the reason below." :
                   isPending  ? "Our curators are carefully reviewing your heritage expertise. We are currently verifying your documentation and assessing your cultural connection is aligned with our quality standards." :
                                "Your application is saved. Complete all steps and submit when ready."}
                </p>
              </div>
            </div>

            {/* rejection reason */}
            {isRejected && rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Reason</p>
                <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{rejectionReason}</p>
              </div>
            )}

            {/* status footer */}
            <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/10 dark:border-zinc-800">
              <div className={`w-2 h-2 rounded-full ${isPending ? "bg-primary animate-pulse" : isApproved ? "bg-emerald-500" : isRejected ? "bg-red-500" : "bg-zinc-400"}`} />
              <span className="text-[11px] font-semibold text-on-surface-variant dark:text-zinc-400">
                {isPending  ? "Currently with Curator Team" :
                 isApproved ? "Review Complete" :
                 isRejected ? "Review Concluded" :
                              "Awaiting Submission"}
              </span>
              <span className="ml-auto text-[11px] text-on-surface-variant/70 dark:text-zinc-500">
                Updated {updatedLabel}
              </span>
            </div>
          </div>

          {/* Need Assistance card */}
          <div className="bg-primary dark:bg-[#063a28] rounded-2xl shadow-lg p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 blur-2xl" style={{ background: "#ffddb8" }} />
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-white text-base mb-2">Need Assistance?</h3>
              <p className="text-white/70 text-xs leading-relaxed mb-6">
                Have questions about your application or need to update your submitted information? Our host support team is here to help.
              </p>
              <a
                href="mailto:support@endebeto.com"
                className="flex items-center justify-center gap-2 bg-white text-primary font-headline font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-sm w-full"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* ── What's Next section ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/15 dark:border-zinc-800 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary dark:text-green-400 mb-1">The Process</p>
              <h2 className="font-headline font-bold text-lg text-on-surface dark:text-white">What's Next?</h2>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 max-w-[220px] text-right hidden sm:block leading-relaxed">
              Here's the 4-step process every host undergoes to ensure authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROCESS_STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low dark:bg-zinc-800/50 border border-outline-variant/10 dark:border-zinc-700/50 hover:border-primary/20 dark:hover:border-green-400/20 transition-colors group">
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <span className="font-headline font-black text-[11px] text-primary/50 dark:text-green-400/50 tracking-wider">{n}</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/8 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/15 dark:group-hover:bg-primary/30 transition-colors">
                    <Icon className="h-4 w-4 text-primary dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">{title}</p>
                  <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Approved CTA */}
          {isApproved && (
            <div className="mt-6 pt-6 border-t border-outline-variant/10 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
              <Link to="/host/experiences/create"
                className="flex-1 flex items-center justify-between gap-3 p-4 bg-primary/8 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-xl group hover:bg-primary/12 transition-colors">
                <div>
                  <p className="text-sm font-bold text-primary dark:text-green-400">Create Your First Experience</p>
                  <p className="text-xs text-on-surface-variant dark:text-zinc-400">List and start welcoming guests</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
              <Link to="/host-dashboard"
                className="flex-1 flex items-center justify-between gap-3 p-4 bg-surface-container dark:bg-zinc-800 border border-outline-variant/20 dark:border-zinc-700 rounded-xl group hover:border-primary/30 transition-colors">
                <div>
                  <p className="text-sm font-bold text-on-surface dark:text-white">Go to Dashboard</p>
                  <p className="text-xs text-on-surface-variant dark:text-zinc-400">View earnings and bookings</p>
                </div>
                <ArrowRight className="h-4 w-4 text-on-surface-variant group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>
          )}

          {isRejected && (
            <div className="mt-6 pt-6 border-t border-outline-variant/10 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => reapplyMutation.mutate()}
                disabled={reapplyMutation.isPending}
                className="inline-flex items-center gap-2 bg-primary text-white font-headline font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {reapplyMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Resetting…</>
                ) : (
                  <><RefreshCw className="h-4 w-4" /> Reapply Now</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/15 dark:border-zinc-800 shadow-sm px-5 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-on-surface dark:text-white">Questions about your application?</p>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400">Our team typically responds within 24 hours.</p>
          </div>
          <a href="mailto:support@endebeto.com"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-green-400 hover:underline underline-offset-2 transition-colors shrink-0">
            <Mail className="h-3.5 w-3.5" /> support@endebeto.com
          </a>
        </div>

      </div>
    </div>
  );
}
