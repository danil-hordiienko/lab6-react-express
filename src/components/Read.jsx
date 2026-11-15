import { useEffect, useState } from 'react'
import { movieApi } from '../movieApi.js'
import Movies from './Movies.jsx'

export default function Read() {
  // Store the server data separately from loading and error messages.
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // The signal lets Axios cancel this request during cleanup.
    const controller = new AbortController()

    // Fetch a fresh list each time the route opens.
    // That includes any movies added on the Create page.
    movieApi.get('/api/movies', { signal: controller.signal })
      .then((response) => {
        // Express wraps the array in a movies property.
        // Check the shape before passing it to the card list.
        if (!Array.isArray(response.data?.movies)) {
          throw new Error('The server returned an invalid movie list.')
        }
        // Updating state causes React to render the returned movie cards.
        if (!controller.signal.aborted) setMovies(response.data.movies)
      })
      .catch(() => {
        // Leaving the page is an intentional cancellation, not a loading error.
        if (!controller.signal.aborted) {
          setError('Could not load movies. Please try again later.')
        }
      })
      .finally(() => {
        // End the loading state after either success or failure.
        if (!controller.signal.aborted) setLoading(false)
      })

    // Cancel the request if we leave Read before it finishes.
    return () => controller.abort()
  }, []) // Run when Read mounts, rather than on every render.

  return (
    <section>
      <h2 className="mb-4">This is my Read Component.</h2>
      {loading && <p role="status">Loading movies...</p>}
      {error && <p className="text-danger" role="alert">{error}</p>}
      {/* An empty list is a valid reply.
          Show it only after the request has actually finished. */}
      {!loading && !error && (
        movies.length > 0 ? <Movies myMovies={movies} /> : <p>No movies found.</p>
      )}
    </section>
  )
}
