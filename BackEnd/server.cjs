const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { randomUUID } = require('node:crypto')
const sampleMovies = require('./movies.json')

const app = express()
const port = Number(process.env.PORT || 4000)

// Start with the three films from the lab.
// Extra films live in this array until the server stops.
const movies = [...sampleMovies]

// The React page and the API use different ports.
// Allow the local Vite page to read replies and send JSON.
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))

// Read both HTML form data and JSON before the POST handler runs.
// A small body limit is enough for three text fields.
app.use(bodyParser.urlencoded({ extended: true, limit: '16kb' }))
app.use(bodyParser.json({ limit: '16kb' }))

app.get('/api/movies', (req, res) => {
  // Read expects an object with a movies array.
  // Send the current list, including films added through POST.
  res.json({ movies })
})

app.post('/api/movies', (req, res) => {
  // The form sends lowercase names; validate them before building the card data.
  // Reject arrays, objects and missing values rather than turning them into text.
  const { title, year, poster } = req.body ?? {}
  if (typeof title !== 'string' || typeof poster !== 'string' ||
      (typeof year !== 'string' && typeof year !== 'number')) {
    return res.status(400).json({ error: 'Enter a title, year and poster URL.' })
  }

  const cleanTitle = title.trim()
  const cleanYear = String(year).trim()
  const cleanPoster = poster.trim()

  // Browser validation is useful for typing, but other clients can skip it.
  // Check the title, year and URL again before adding anything to the array.
  if (!cleanTitle || cleanTitle.length > 200) {
    return res.status(400).json({ error: 'Enter a title of 1 to 200 characters.' })
  }
  if (!/^\d{4}$/.test(cleanYear) || Number(cleanYear) < 1888) {
    return res.status(400).json({ error: 'Enter a four-digit year from 1888 onward.' })
  }
  if (cleanPoster.length > 2048 || !/^https?:\/\//i.test(cleanPoster) || !URL.canParse(cleanPoster)) {
    return res.status(400).json({ error: 'Enter a valid HTTP or HTTPS poster URL.' })
  }

  // Match the same property names used by the original movie cards.
  // New films have no IMDb ID, so generate a unique key locally.
  const movie = { Title: cleanTitle, Year: cleanYear, imdbID: randomUUID(), Type: 'movie', Poster: cleanPoster }
  movies.push(movie)
  return res.status(201).json(movie)
})

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }))

// The parser can reject a request before it reaches a route.
// Keep error responses in JSON so the form can show the message.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  if (error.status === 400) return res.status(400).json({ error: 'Invalid request body.' })
  if (error.status === 413) return res.status(413).json({ error: 'Request body is too large.' })
  if (error.status === 415) return res.status(415).json({ error: 'Unsupported request encoding.' })
  console.error(error)
  return res.status(500).json({ error: 'Something went wrong.' })
})

// Bind to the local machine because this API is only used for the lab.
// Requiring the app for a check does not start a second listener.
if (require.main === module) {
  const server = app.listen(port, 'localhost', () => console.log(`API: http://localhost:${port}`))
  server.on('error', (error) => {
    console.error(`Could not start the API: ${error.message}`)
    process.exitCode = 1
  })
}

module.exports = app
