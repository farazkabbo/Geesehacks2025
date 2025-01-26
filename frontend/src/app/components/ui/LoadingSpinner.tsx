// src/app/components/ui/LoadingSpinner.tsx
export default function LoadingSpinner() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1D1321]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-plum-400"></div>
      </div>
    )
  }