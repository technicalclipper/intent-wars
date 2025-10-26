// Global storage that persists across requests
declare global {
  var __rooms: Map<string, any> | undefined
  var __waitingRooms: Map<string, any> | undefined
  var __results: Map<string, any> | undefined
}

// Initialize global storage if it doesn't exist
if (!global.__rooms) {
  global.__rooms = new Map<string, any>()
}
if (!global.__waitingRooms) {
  global.__waitingRooms = new Map<string, any>()
}
if (!global.__results) {
  global.__results = new Map<string, any>()
}

export const rooms = global.__rooms
export const waitingRooms = global.__waitingRooms
export const results = global.__results
