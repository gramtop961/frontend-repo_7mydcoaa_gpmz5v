import { Star, Store, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SmartProductCard({ product, onSelect }) {
  const bestRetailer = product.retailers?.find(r => r.is_best)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {product.image && (
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{product.title}</h4>
            <button
              onClick={() => onSelect?.(product)}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Details
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
            <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
              <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" /> {product.rating}
            </span>
            {bestRetailer && (
              <span className="ml-2 text-[10px] rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">Best price: {bestRetailer.name}</span>
            )}
          </div>
          {product.specs?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.specs.slice(0, 4).map((s, i) => (
                <span key={i} className="text-[11px] rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{s}</span>
              ))}
            </div>
          )}
          {product.retailers?.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.retailers.map((r, i) => (
                <a
                  key={i}
                  href={r.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${r.is_best ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="inline-flex items-center gap-1"><Store className="h-3.5 w-3.5" />{r.name}</span>
                  <span className="font-semibold">${r.price.toFixed(2)}</span>
                </a>
              ))}
            </div>
          )}
          {product.why && (
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-gray-600" title={product.why}>
              <Info className="h-3.5 w-3.5" /> Why we recommend this
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
