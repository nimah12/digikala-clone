import { prisma } from '@/lib/prisma'

export default async function Home() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>محصولات فروشگاه</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
              {product.category.name}
            </div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h2>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>
              {product.description}
            </p>
            <div style={{ fontWeight: 'bold' }}>
              {product.price.toLocaleString('fa-IR')} تومان
            </div>
            <div style={{ fontSize: '0.8rem', color: product.stock > 0 ? 'lightgreen' : 'red' }}>
              {product.stock > 0 ? `موجودی: ${product.stock}` : 'ناموجود'}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}