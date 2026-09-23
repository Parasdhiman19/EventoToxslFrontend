import API from './api'

/**
 * Social API helper for Evento event likes, bookmarks, comments, replies, and comment likes.
 * All functions connect directly to the real Django REST backend.
 */

export async function getEventLikes(eventId) {
  const res = await API.get(`events/${eventId}/like/`)
  return res.data
}

export async function toggleEventLike(eventId) {
  const res = await API.post(`events/${eventId}/like/`)
  return res.data
}

export async function toggleEventBookmark(eventId) {
  const res = await API.post(`events/${eventId}/bookmark/`)
  return res.data
}

export async function getEventComments(eventId, page = 1, pageSize = 20) {
  const res = await API.get(`events/${eventId}/comments/`, {
    params: { page, page_size: pageSize },
  })
  return res.data
}

export async function createEventComment(eventId, content, parentId = null) {
  const payload = { content }
  if (parentId) {
    payload.parentId = parentId
  }
  const res = await API.post(`events/${eventId}/comments/`, payload)
  return res.data
}

export async function editEventComment(eventId, commentId, content) {
  const res = await API.patch(`events/${eventId}/comments/${commentId}/`, { content })
  return res.data
}

export async function deleteEventComment(eventId, commentId) {
  const res = await API.delete(`events/${eventId}/comments/${commentId}/`)
  return res.data
}

export async function toggleCommentLike(eventId, commentId) {
  const res = await API.post(`events/${eventId}/comments/${commentId}/like/`)
  return res.data
}
