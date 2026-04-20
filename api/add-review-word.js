const REPO = 'luigicaloi/DueItaliani'
const VALID_USERS = ['Luigi', 'Jasmine']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, italian, portuguese, english = '', notes = '' } = req.body ?? {}

  if (!VALID_USERS.includes(userId) || !italian || !portuguese) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const filePath = `review/${userId}/review_words.md`
  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${filePath}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }

  // Fetch current file
  const getRes = await fetch(apiUrl, { headers })
  if (!getRes.ok) {
    return res.status(500).json({ error: 'Failed to fetch review file' })
  }
  const fileData = await getRes.json()
  const sha = fileData.sha
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8')

  // Check for duplicate
  const tableRowPattern = new RegExp(`\\|\\s*${escapeRegex(italian)}\\s*\\|`, 'i')
  if (tableRowPattern.test(currentContent)) {
    return res.status(409).json({ error: 'duplicate' })
  }

  // Insert new row before the trailing empty table row `| | | | |`
  const newRow = `| ${italian} | ${portuguese} | ${english} | ${notes} |`
  const updatedContent = currentContent.replace(
    /(\| \| \| \| \|\s*)$/m,
    `${newRow}\n$1`
  )

  // Commit updated file
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Add "${italian}" to ${userId} review words`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha,
    }),
  })

  if (!putRes.ok) {
    const err = await putRes.text()
    console.error('GitHub PUT failed:', err)
    return res.status(500).json({ error: 'Failed to save word' })
  }

  return res.status(200).json({ ok: true })
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
