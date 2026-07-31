import ConfirmDialog from '#/app/components/ConfirmDialog'

export default function DuplicateProjectDialog({
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
      title={`Dupliquer ${projectName}`}
      description={`Créer une copie du projet pour expérimenter sans modifier l’original.`}
      confirmLabel="Dupliquer"
      cancelLabel="Annuler"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
