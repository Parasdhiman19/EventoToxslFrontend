/**
 * Generates uppercase 1-2 character initials for avatar fallback.
 * @param {string} name - Full name or email string
 * @param {string} fallback - Fallback initials if name is empty (default 'EV')
 * @returns {string} 1-2 uppercase characters
 */
export function getAvatarInitials(name, fallback = 'EV') {
  if (!name || typeof name !== 'string') return fallback

  const clean = name.trim()
  if (!clean) return fallback

  // If it's an email address, extract username part before @
  const source = clean.includes('@') ? clean.split('@')[0] : clean
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return fallback
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[1][0]).toUpperCase()
}
