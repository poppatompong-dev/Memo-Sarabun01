'use client'

export default function PrintActions() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-1.5 rounded-lg font-medium transition-colors"
    >
      🖨️ พิมพ์
    </button>
  )
}
