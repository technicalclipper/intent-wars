import { NextRequest, NextResponse } from 'next/server'
import { rooms, waitingRooms } from '../shared-storage'

export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json()
    
    if (!walletId) {
      return NextResponse.json({ error: 'Wallet ID required' }, { status: 400 })
    }

    // Check if there's a waiting room
    const waitingRoom = Array.from(waitingRooms.values()).find(room => room.status === 'waiting')
    
    if (waitingRoom) {
      // Join existing room as player2
      waitingRoom.player2 = walletId
      waitingRoom.status = 'active'
      // Keep the same roomId, don't create a new one
      
      console.log('Moving room from waiting to active:', waitingRoom.id)
      console.log('Room before move:', waitingRoom)
      
      // Move from waiting to active rooms using the original waiting room ID
      rooms.set(waitingRoom.id, waitingRoom)
      waitingRooms.delete(waitingRoom.id)
      
      console.log('Room moved to active rooms')
      console.log('Active rooms after move:', Array.from(rooms.keys()))
      
      return NextResponse.json({
        roomId: waitingRoom.id,
        role: 'player2',
        status: 'matched'
      })
    } else {
      // Create new waiting room
      const roomId = `waiting_${Date.now()}`
      const newRoom = {
        id: roomId,
        player1: walletId,
        player2: null,
        status: 'waiting',
        createdAt: Date.now()
      }
      
      console.log('Creating new waiting room:', roomId)
      console.log('Room object:', newRoom)
      
      waitingRooms.set(roomId, newRoom)
      
      console.log('Waiting rooms after creation:', Array.from(waitingRooms.keys()))
      
      return NextResponse.json({
        roomId: roomId,
        role: 'player1',
        status: 'waiting'
      })
    }
  } catch (error) {
    console.error('Error creating/joining room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')
  
  console.log('GET room request for:', roomId)
  console.log('Available rooms:', Array.from(rooms.keys()))
  console.log('Available waiting rooms:', Array.from(waitingRooms.keys()))
  console.log('Room size check:', rooms.size, waitingRooms.size)
  
  if (roomId) {
    const room = rooms.get(roomId) || waitingRooms.get(roomId)
    console.log('Room found:', room)
    if (room) {
      return NextResponse.json(room)
    } else {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
  }
  
  // Return all active rooms
  return NextResponse.json(Array.from(rooms.values()))
}
