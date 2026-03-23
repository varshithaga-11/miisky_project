// This file is no longer used in React
// API endpoints are handled by the Django backend at http://localhost:8000/api/
// To send contact messages, make a fetch request to the backend:
// fetch('http://localhost:8000/api/contact/', { method: 'POST', body: JSON.stringify(...) })

export async function POST() {
  return new Response(
    JSON.stringify({ 
      error: "This endpoint is deprecated. Use the Django backend API instead." 
    }),
    { status: 410 }
  );
}
