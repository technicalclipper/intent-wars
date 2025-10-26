import { NextRequest, NextResponse } from 'next/server'
import { rooms, waitingRooms, results } from '../shared-storage'

export async function POST(request: NextRequest) {
  try {
    const { roomId, walletId, totalManaUsed, duration } = await request.json()
    
    console.log('Submit result request:', { roomId, walletId, totalManaUsed, duration })
    console.log('Current results in storage:', Array.from(results.entries()))
    
    if (!roomId || !walletId || totalManaUsed === undefined || duration === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store the result with a unique key that includes timestamp to avoid overwrites
    const timestamp = Date.now()
    const resultKey = `${roomId}_${walletId}_${timestamp}`
    results.set(resultKey, {
      roomId,
      walletId,
      totalManaUsed,
      duration,
      submittedAt: Date.now()
    })
    
    console.log('Stored result with key:', resultKey)

    // Check if both players have submitted
    let room = rooms.get(roomId) || waitingRooms.get(roomId)
    console.log('Submit result - Room found:', room)
    console.log('Submit result - Available rooms:', Array.from(rooms.keys()))
    console.log('Submit result - Available waiting rooms:', Array.from(waitingRooms.keys()))
    console.log('Submit result - Room size check:', rooms.size, waitingRooms.size)
    
    if (room) {
      console.log('Room found, processing results...')
      // If room is in waitingRooms, move it to active rooms
      if (waitingRooms.has(roomId)) {
        console.log('Moving room from waiting to active')
        waitingRooms.delete(roomId)
        rooms.set(roomId, room)
      }
      
      // Find results for both players by looking for all results with this room ID
      const allResults = Array.from(results.entries())
        .filter(([key, result]) => key.startsWith(`${roomId}_`))
        .map(([key, result]) => result)
      
      console.log('All results for room:', allResults)
      
      // Get the two most recent results (assuming two players)
      const sortedResults = allResults.sort((a, b) => b.submittedAt - a.submittedAt)
      const player1Result = sortedResults[0] // Most recent
      const player2Result = sortedResults[1] // Second most recent
      
      console.log('Player results:', { player1Result, player2Result })
      
      if (player1Result && player2Result) {
        // Both players have submitted, calculate winner
        const winner = calculateWinner(player1Result, player2Result)
        
        // Update room with results
        room.results = {
          player1: player1Result,
          player2: player2Result,
          winner,
          completedAt: Date.now()
        }
        room.status = 'completed'
        
        rooms.set(roomId, room)
        
        console.log('Game completed, winner calculated:', winner)
        
        return NextResponse.json({
          status: 'completed',
          winner,
          results: room.results
        })
      } else {
        console.log('Waiting for opponent to submit results')
        return NextResponse.json({
          status: 'waiting_for_opponent',
          message: 'Waiting for opponent to submit results'
        })
      }
    } else {
      console.log('Room not found, but result stored')
      return NextResponse.json({
        status: 'submitted',
        message: 'Result submitted successfully (room not found)'
      })
    }

    return NextResponse.json({
      status: 'submitted',
      message: 'Result submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting result:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateWinner(player1Result: any, player2Result: any) {
  // Calculate efficiency score: score = (1000 / totalManaUsed) + (500 / duration)
  const player1Score = (1000 / player1Result.totalManaUsed) + (500 / player1Result.duration)
  const player2Score = (1000 / player2Result.totalManaUsed) + (500 / player2Result.duration)
  
  if (player1Score > player2Score) {
    return {
      winner: 'player1',
      player1Score,
      player2Score,
      margin: player1Score - player2Score
    }
  } else if (player2Score > player1Score) {
    return {
      winner: 'player2',
      player1Score,
      player2Score,
      margin: player2Score - player1Score
    }
  } else {
    return {
      winner: 'tie',
      player1Score,
      player2Score,
      margin: 0
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')
  
  if (roomId) {
    const room = rooms.get(roomId)
    if (room && room.results) {
      return NextResponse.json(room.results)
    } else {
      return NextResponse.json({ error: 'Results not ready' }, { status: 404 })
    }
  }
  
  return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
}
