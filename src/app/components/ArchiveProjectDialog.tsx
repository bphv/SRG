import ConfirmDialog from '#/app/components/ConfirmDialog'

export default function ArchiveProjectDialog({
  projectName,
  onConfirm,
  onCancel,
}: {
  projectName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <ConfirmDialog
      title={`Archiver ${projectName}`}
      description={`Archiver ce projet permet de le conserver sans le mélanger aux projets actifs.`}
      confirmLabel="Archiver"
      cancelLabel="Annuler"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
