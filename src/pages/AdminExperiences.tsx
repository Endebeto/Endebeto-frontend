import AdminLayout from "@/components/AdminLayout";
import { ExperienceCatalogSidebar } from "@/components/admin-experiences/ExperienceCatalogSidebar";
import { ExperienceDetailPanel } from "@/components/admin-experiences/ExperienceDetailPanel";
import { ExperienceSelectPlaceholder } from "@/components/admin-experiences/ExperienceSelectPlaceholder";
import { SuspendModal } from "@/components/admin-experiences/SuspendModal";
import { useAdminExperiences } from "@/hooks/useAdminExperiences";

export default function AdminExperiences() {
  const {
    tab,
    setTab,
    setPage,
    searchInput,
    search,
    handleSearch,
    selected,
    setSelected,
    suspendModalExp,
    setSuspendModalExp,
    experiences,
    catalogTotal,
    catalogPages,
    catalogPage,
    isLoading,
    isError,
    suspendMutation,
    reinstateMutation,
  } = useAdminExperiences();

  return (
    <AdminLayout
      searchPlaceholder="Search title, host, or location…"
      searchValue={searchInput}
      onSearch={handleSearch}
    >
      {suspendModalExp && (
        <SuspendModal
          exp={suspendModalExp}
          isPending={suspendMutation.isPending}
          onClose={() => setSuspendModalExp(null)}
          onConfirm={(reason) =>
            suspendMutation.mutate({ id: suspendModalExp._id, reason })
          }
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <ExperienceCatalogSidebar
          tab={tab}
          onTabChange={(t) => {
            setTab(t);
            setPage(1);
            setSelected(null);
          }}
          experiences={experiences}
          isLoading={isLoading}
          isError={isError}
          search={search}
          selected={selected}
          onSelectToggle={(exp) =>
            setSelected(selected?._id === exp._id ? null : exp)
          }
          catalogTotal={catalogTotal}
          catalogPages={catalogPages}
          catalogPage={catalogPage}
          onPageChange={setPage}
        />

        {selected && (
          <div className="flex-1 bg-surface dark:bg-zinc-950 overflow-hidden flex flex-col">
            <ExperienceDetailPanel
              exp={selected}
              tab={tab}
              onClose={() => setSelected(null)}
              onOpenSuspend={() => setSuspendModalExp(selected)}
              onReinstate={() => reinstateMutation.mutate(selected._id)}
              reinstatePending={reinstateMutation.isPending}
            />
          </div>
        )}

        {!selected && <ExperienceSelectPlaceholder />}
      </div>
    </AdminLayout>
  );
}
