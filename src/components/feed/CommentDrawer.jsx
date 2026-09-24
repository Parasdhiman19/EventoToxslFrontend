import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  X,
  Send,
  Heart,
  MessageSquare,
  CornerDownRight,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  ShieldCheck,
  Building2,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react'
import gsap from 'gsap'
import {
  getEventComments,
  createEventComment,
  editEventComment,
  deleteEventComment,
  toggleCommentLike,
} from '../../services/socialApi'
import { useAuthPrompt } from '../../context/AuthPromptContext'

export default function CommentDrawer({
  isOpen,
  onClose,
  event,
  onCommentCountChange,
}) {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {})
  const { openAuthPrompt } = useAuthPrompt()
  const [comments, setComments] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null) // { id, authorName }

  // Edit state
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')

  const drawerRef = useRef(null)
  const inputRef = useRef(null)

  // Animate drawer open/close
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      gsap.fromTo(
        drawerRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [isOpen])

  // Fetch comments when drawer opens or event changes
  useEffect(() => {
    if (!isOpen || !event?.id) return

    let isMounted = true
    setIsLoading(true)
    setErrorMessage(null)
    setPage(1)

    getEventComments(event.id, 1, 20)
      .then((data) => {
        if (!isMounted) return
        setComments(data.results || [])
        setTotalCount(data.totalComments || 0)
        setHasMore(!!data.hasMore)
        if (onCommentCountChange) {
          onCommentCountChange(event.id, data.totalComments || 0)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setErrorMessage(err.response?.data?.detail || 'Failed to load comments.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, event?.id])

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus()
    }
  }, [replyingTo])

  // Load more pagination
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !event?.id) return
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await getEventComments(event.id, nextPage, 20)
      setComments((prev) => [...prev, ...(data.results || [])])
      setPage(nextPage)
      setHasMore(!!data.hasMore)
    } catch {
      // Ignored
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Handle comment/reply submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = commentText.trim()
    if (!trimmed || isSubmitting || !event?.id) return

    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'comment',
        title: 'Join the Discussion',
        subtitle: `Sign in to post a comment or chat with attendees about "${event?.title || 'this live stage'}".`,
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const parentId = replyingTo ? replyingTo.id : null
      const created = await createEventComment(event.id, trimmed, parentId)

      if (parentId) {
        // Nested reply: append to parent's replies
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                repliesCount: (c.repliesCount || 0) + 1,
                replies: [...(c.replies || []), created],
              }
            }
            return c
          })
        )
      } else {
        // Top-level comment: prepend to comments list
        setComments((prev) => [created, ...prev])
      }

      setTotalCount((prev) => {
        const next = prev + 1
        if (onCommentCountChange) {
          onCommentCountChange(event.id, next)
        }
        return next
      })

      setCommentText('')
      setReplyingTo(null)
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || err.response?.data?.content?.[0] || 'Unable to post comment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle comment like toggle
  const handleToggleLike = async (commentId, isReply = false, parentId = null) => {
    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'like',
        title: 'Support this Comment',
        subtitle: 'Sign in to upvote comments and replies from fellow attendees.',
      })
      return
    }

    try {
      const data = await toggleCommentLike(event.id, commentId)

      setComments((prev) =>
        prev.map((c) => {
          if (!isReply && c.id === commentId) {
            return { ...c, isLiked: data.isLiked, likeCount: data.likeCount }
          }
          if (isReply && c.id === parentId && Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, isLiked: data.isLiked, likeCount: data.likeCount } : r
              ),
            }
          }
          return c
        })
      )
    } catch {
      // Ignored
    }
  }

  // Handle save edit
  const handleSaveEdit = async (commentId, isReply = false, parentId = null) => {
    const trimmed = editingText.trim()
    if (!trimmed || !event?.id) return

    try {
      const updated = await editEventComment(event.id, commentId, trimmed)

      setComments((prev) =>
        prev.map((c) => {
          if (!isReply && c.id === commentId) {
            return { ...c, content: updated.content, rawContent: updated.rawContent, updatedAt: updated.updatedAt }
          }
          if (isReply && c.id === parentId && Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? { ...r, content: updated.content, rawContent: updated.rawContent, updatedAt: updated.updatedAt }
                  : r
              ),
            }
          }
          return c
        })
      )
      setEditingCommentId(null)
      setEditingText('')
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.content?.[0] || 'Failed to edit comment.')
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteEventComment(event.id, commentId)

      setComments((prev) =>
        prev.map((c) => {
          if (!isReply && c.id === commentId) {
            return {
              ...c,
              isDeleted: true,
              content: '[This comment was deleted by user]',
              canEdit: false,
              canDelete: false,
            }
          }
          if (isReply && c.id === parentId && Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? {
                      ...r,
                      isDeleted: true,
                      content: '[This comment was deleted by user]',
                      canEdit: false,
                      canDelete: false,
                    }
                  : r
              ),
            }
          }
          return c
        })
      )

      setTotalCount((prev) => {
        const next = Math.max(0, prev - 1)
        if (onCommentCountChange) {
          onCommentCountChange(event.id, next)
        }
        return next
      })
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete comment.')
    }
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={drawerRef}
        className="w-full sm:max-w-xl h-[88vh] sm:h-[680px] bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* 1. DRAWER HEADER */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center shadow-xs">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-semibold text-stone-900 leading-tight">
                  Stage Discussion
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                  {totalCount}
                </span>
              </div>
              <p className="text-[11px] font-mono text-stone-400 truncate max-w-[280px] sm:max-w-md">
                {event.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Close comments"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. COMMENTS LIST SCROLLER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-400">
              <Loader2 size={24} className="animate-spin text-stone-900" />
              <span className="text-xs font-mono">Loading real attendee discussions...</span>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Sparkles size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-base font-medium text-stone-900">
                  No questions or comments yet
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Ask the host about parking, door open times, or VIP perks to start the conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    comment.isDeleted
                      ? 'bg-stone-50/50 border-stone-200/50 opacity-60'
                      : 'bg-stone-50/80 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  {/* Top Comment Author & Time */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center uppercase select-none overflow-hidden shrink-0 border border-stone-300/60 shadow-2xs">
                        {comment.user?.avatarUrl || comment.user?.avatar_url ? (
                          <img
                            src={comment.user.avatarUrl || comment.user.avatar_url}
                            alt={comment.authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(comment.authorName || 'U')[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-stone-900">
                            {comment.authorName}
                          </span>
                          {comment.user?.isOrganizer && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-medium">
                              Host
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          {comment.createdAtFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu (Edit/Delete) */}
                    {!comment.isDeleted && (comment.canEdit || comment.canDelete) && (
                      <div className="flex items-center gap-1">
                        {comment.canEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment.id)
                              setEditingText(comment.rawContent || comment.content)
                            }}
                            className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                            title="Edit comment"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {comment.canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id, false)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Body or Inline Edit Form */}
                  <div className="mt-2 text-xs sm:text-[13px] text-stone-700 font-sans leading-relaxed">
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={2}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(comment.id, false)}
                            className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-stone-900 text-stone-50 hover:bg-black cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className={comment.isDeleted ? 'italic text-stone-400' : ''}>
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {/* Comment Bottom Actions: Like & Reply */}
                  {!comment.isDeleted && (
                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-mono text-stone-500">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(comment.id, false)}
                          className={`inline-flex items-center gap-1 transition cursor-pointer ${
                            comment.isLiked ? 'text-rose-600 font-semibold' : 'hover:text-stone-900'
                          }`}
                        >
                          <Heart
                            size={13}
                            fill={comment.isLiked ? 'currentColor' : 'none'}
                            className={comment.isLiked ? 'text-rose-600' : ''}
                          />
                          <span>{comment.likeCount || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              openAuthPrompt({
                                actionType: 'comment',
                                title: 'Reply to Comment',
                                subtitle: `Sign in to reply to @${comment.authorName || 'this attendee'}.`,
                              })
                              return
                            }
                            setReplyingTo({ id: comment.id, authorName: comment.authorName })
                          }}
                          className="inline-flex items-center gap-1 hover:text-stone-900 transition cursor-pointer"
                        >
                          <CornerDownRight size={12} />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. NESTED REPLIES */}
                  {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                    <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-stone-200 space-y-2.5">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            reply.isDeleted
                              ? 'bg-stone-50/40 border-stone-200/40 opacity-60'
                              : 'bg-white border-stone-200/90 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center uppercase select-none overflow-hidden shrink-0 border border-stone-300/60">
                                {reply.user?.avatarUrl || reply.user?.avatar_url ? (
                                  <img
                                    src={reply.user.avatarUrl || reply.user.avatar_url}
                                    alt={reply.authorName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{(reply.authorName || 'U')[0]}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-stone-900 text-[11px]">
                                  {reply.authorName}
                                </span>
                                {reply.user?.isOrganizer && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.1 rounded bg-amber-100 text-amber-900 text-[9px] font-mono font-medium">
                                    Host
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-stone-400">
                                  &bull; {reply.createdAtFormatted}
                                </span>
                              </div>
                            </div>

                            {!reply.isDeleted && (reply.canEdit || reply.canDelete) && (
                              <div className="flex items-center gap-1">
                                {reply.canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCommentId(reply.id)
                                      setEditingText(reply.rawContent || reply.content)
                                    }}
                                    className="p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                )}
                                {reply.canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                    className="p-0.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="mt-1 text-stone-700 font-sans leading-relaxed">
                            {editingCommentId === reply.id ? (
                              <div className="space-y-1.5 pt-1">
                                <textarea
                                  rows={2}
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full p-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                                />
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2 py-0.5 text-[10px] font-mono rounded border border-stone-200 text-stone-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(reply.id, true, comment.id)}
                                    className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-stone-900 text-stone-50"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className={reply.isDeleted ? 'italic text-stone-400' : ''}>
                                {reply.content}
                              </p>
                            )}
                          </div>

                          {!reply.isDeleted && (
                            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-stone-500">
                              <button
                                type="button"
                                onClick={() => handleToggleLike(reply.id, true, comment.id)}
                                className={`inline-flex items-center gap-1 transition cursor-pointer ${
                                  reply.isLiked ? 'text-rose-600 font-semibold' : 'hover:text-stone-900'
                                }`}
                              >
                                <Heart
                                  size={11}
                                  fill={reply.isLiked ? 'currentColor' : 'none'}
                                  className={reply.isLiked ? 'text-rose-600' : ''}
                                />
                                <span>{reply.likeCount || 0}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-4 py-2 text-xs font-mono rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    {isLoadingMore ? 'Loading earlier comments...' : 'Load Earlier Comments'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. COMMENT INPUT BAR */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white">
          {replyingTo && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-between text-xs font-mono text-stone-600 animate-in fade-in duration-150">
              <span className="truncate">
                Replying to <strong className="text-stone-900">@{replyingTo.authorName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isAuthenticated
                  ? replyingTo
                    ? `Reply to @${replyingTo.authorName}...`
                    : 'Ask the host or leave a comment...'
                  : 'Log in to join the stage discussion...'
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-stone-900 text-stone-50 font-mono text-xs font-semibold uppercase tracking-wider hover:bg-black transition disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Send size={13} />
                  <span className="hidden sm:inline">Post</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
