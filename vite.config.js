import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function reviewWordPlugin() {
  return {
    name: 'review-word-api',
    configureServer(server) {
      server.middlewares.use('/api/add-review-word', (req, res, next) => {
        if (req.method !== 'POST') return next()

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { userId, italian, portuguese, english, notes } = JSON.parse(body)

            const folderName = userId.charAt(0).toUpperCase() + userId.slice(1).toLowerCase()
            const filePath = resolve(__dirname, 'review', folderName, 'review_words.md')

            if (!existsSync(filePath)) {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Review file not found' }))
              return
            }

            let content = readFileSync(filePath, 'utf-8')

            // Remove the empty placeholder row if present
            content = content.replace(/^\| *\| *\| *\| *\|[ \t]*$/m, '')
            content = content.replace(/\n{3,}/g, '\n\n')

            const newRow = `| ${italian} | ${portuguese} | ${english || ''} | ${notes || ''} |`

            // Insert before the first "## " subsection, or append at end
            const subIdx = content.search(/\n## /)
            if (subIdx !== -1) {
              content = content.slice(0, subIdx).trimEnd() + '\n' + newRow + content.slice(subIdx)
            } else {
              content = content.trimEnd() + '\n' + newRow + '\n'
            }

            writeFileSync(filePath, content, 'utf-8')

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), reviewWordPlugin()],
})
