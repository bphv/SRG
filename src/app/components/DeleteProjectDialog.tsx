import ConfirmDialog from '#/app/components/ConfirmDialog'

export default function DeleteProjectDialog({
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
      title={`Supprimer ${projectName}`}
      description={`Cette action est irréversible. Le projet et toutes ses générations associées seront supprimés.`}
      confirmLabel="Supprimer"
      cancelLabel="Annuler"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
