export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Properlia - Real Estate Management</h1>
      <p>Welcome to Properlia property management platform.</p>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
    </main>
  )
}
