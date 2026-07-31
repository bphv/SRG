export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center text-red-900">
      <p className="text-xl font-semibold">Something went wrong</p>
      <p className="mt-3 text-sm text-red-700">{message}</p>
    </div>
  )
}
