import { useState } from 'react'
import { movieApi } from '../movieApi.js'

export default function Create() {
  // Each input keeps its value in React state.
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [poster, setPoster] = useState('')
  // Keep the request state separate from the input values.
  // A pending request disables the form until Express replies.
  const [saving, setSaving] = useState(false)
  const [savedTitle, setSavedTitle] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    // Stop the browser from navigating away on submit.
    // Axios will send the form values as JSON instead.
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setSavedTitle('')
    setError('')

    try {
      // The API accepts lowercase fields and returns the saved card.
      // Wait for that reply before showing a confirmation.
      const { data } = await movieApi.post('/api/movies', { title: title.trim(), year, poster: poster.trim() })
      setSavedTitle(data.Title)
      setTitle('')
      setYear('')
      setPoster('')
    } catch (requestError) {
      // Use the validation message if Express returned one.
      // Leave the fields filled so they can be corrected or retried.
      setError(requestError.response?.data?.error || 'Could not add the movie. Check that the server is running.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="create-page">
      <h2 className="mb-4">This is my Create Component.</h2>
      {/* Any input change clears feedback from the previous submission. */}
      <form onSubmit={handleSubmit} onChange={() => { setSavedTitle(''); setError('') }}>
        <fieldset disabled={saving} className="mb-0">
          {/* The label matches the input ID; the pattern rejects whitespace-only titles. */}
          <div className="mb-3">
            <label htmlFor="movie-title" className="form-label">Add Movie Title:</label>
            <input id="movie-title" className="form-control" type="text"
              value={title} onChange={(event) => setTitle(event.target.value)}
              required maxLength={200} pattern=".*\S.*" title="Enter a movie title." />
          </div>
          {/* Let the browser check that the year is a whole number in range. */}
          <div className="mb-3">
            <label htmlFor="movie-year" className="form-label">Add Movie Year:</label>
            <input id="movie-year" className="form-control" type="number"
              min="1888" max="9999" step="1" value={year}
              onChange={(event) => setYear(event.target.value)} required />
          </div>
          {/* Accept a web address for the poster rather than a local file path. */}
          <div className="mb-3">
            <label htmlFor="movie-poster" className="form-label">Add Movie Poster:</label>
            <input id="movie-poster" className="form-control" type="url"
              value={poster} onChange={(event) => setPoster(event.target.value)}
              required maxLength={2048} pattern="https?://.+" title="Enter an HTTP or HTTPS image URL." />
          </div>
          <button className="btn btn-primary" type="submit">{saving ? 'Adding...' : 'Add Movie'}</button>
        </fieldset>
      </form>
      {/* A success message confirms a save; an alert explains a failure. */}
      {savedTitle && <p className="mt-3" role="status">Added {savedTitle}.</p>}
      {error && <p className="mt-3 text-danger" role="alert">{error}</p>}
    </section>
  )
}
