import { NextRequest, NextResponse } from 'next/server'
import { rooms, waitingRooms, results } from '../shared-storage'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    rooms: Array.from(rooms.entries()),
    waitingRooms: Array.from(waitingRooms.entries()),
    results: Array.from(results.entries()),
    roomCount: rooms.size,
    waitingRoomCount: waitingRooms.size,
    resultCount: results.size
  })
}
