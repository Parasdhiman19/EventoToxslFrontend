/**
 * Pure helper utility to transform a flat list of user tickets
 * into a hierarchical structure: Organizer -> Events -> Tickets
 */

export function groupTicketsByOrganizerAndEvent(tickets = []) {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return []
  }

  // Intermediate map to organize by organizer -> event
  const organizerMap = new Map()

  for (const ticket of tickets) {
    const organizerName = (ticket.organizer || 'Independent Host').trim()
    const eventTitle = (ticket.eventTitle || ticket.event || 'Untitled Event').trim()

    // 1. Get or initialize Organizer entry
    if (!organizerMap.has(organizerName)) {
      organizerMap.set(organizerName, {
        organizerName,
        eventsMap: new Map(),
      })
    }
    const organizerEntry = organizerMap.get(organizerName)

    // 2. Get or initialize Event entry under this organizer
    if (!organizerEntry.eventsMap.has(eventTitle)) {
      organizerEntry.eventsMap.set(eventTitle, {
        eventTitle,
        date: ticket.date || '',
        doorsOpen: ticket.doorsOpen || '',
        showStarts: ticket.showStarts || '',
        venue: ticket.venue || '',
        address: ticket.address || '',
        tierCounts: {},
        tickets: [],
      })
    }
    const eventEntry = organizerEntry.eventsMap.get(eventTitle)

    // 3. Attach ticket to this event
    eventEntry.tickets.push(ticket)

    // 4. Update tier breakdown count (e.g. "VIP Front Row": 3)
    const tierName = (ticket.tier || 'General Admission').trim()
    eventEntry.tierCounts[tierName] = (eventEntry.tierCounts[tierName] || 0) + 1
  }

  // 5. Convert Maps into formatted arrays with precomputed aggregates
  const result = []

  for (const org of organizerMap.values()) {
    const events = []
    let organizerTicketCount = 0

    for (const ev of org.eventsMap.values()) {
      const totalEventTickets = ev.tickets.length
      organizerTicketCount += totalEventTickets

      // Format tier summary array: [{ tierName: "VIP", count: 3 }]
      const tierSummary = Object.entries(ev.tierCounts).map(([tierName, count]) => ({
        tierName,
        count,
      }))

      events.push({
        eventTitle: ev.eventTitle,
        date: ev.date,
        doorsOpen: ev.doorsOpen,
        showStarts: ev.showStarts,
        venue: ev.venue,
        address: ev.address,
        totalTicketsCount: totalEventTickets,
        tierSummary,
        tickets: ev.tickets,
      })
    }

    result.push({
      organizerName: org.organizerName,
      totalTicketsCount: organizerTicketCount,
      events,
    })
  }

  return result
}
