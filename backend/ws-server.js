const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const server = http.createServer();
const wss = new WebSocket.Server({ 
  server,
  // Allow connections from anywhere in production
  verifyClient: (info) => {
    // In production, you might want to add origin validation here
    return true;
  }
});

// Track clients by email and auction subscriptions
const clients = new Map();
const auctionSubscriptions = new Map(); // auctionId -> Set of client emails

wss.on('connection', (ws, req) => {
  console.log('🔗 New WebSocket connection established');
  
  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      
      if (data.type === 'register' && data.email) {
        clients.set(data.email, ws);
        ws.email = data.email;
        console.log(`✅ User registered: ${data.email}`);
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection_confirmed',
          message: 'Real-time bidding connected successfully!'
        }));
      }
      
      if (data.type === 'subscribe_auction' && data.auctionId && ws.email) {
        if (!auctionSubscriptions.has(data.auctionId)) {
          auctionSubscriptions.set(data.auctionId, new Set());
        }
        auctionSubscriptions.get(data.auctionId).add(ws.email);
        console.log(`📺 User ${ws.email} subscribed to auction ${data.auctionId}`);
        
        // Send subscription confirmation
        ws.send(JSON.stringify({
          type: 'auction_subscribed',
          auctionId: data.auctionId,
          message: `Subscribed to live updates for auction ${data.auctionId}`
        }));
      }
      
      if (data.type === 'unsubscribe_auction' && data.auctionId && ws.email) {
        if (auctionSubscriptions.has(data.auctionId)) {
          auctionSubscriptions.get(data.auctionId).delete(ws.email);
          console.log(`📺 User ${ws.email} unsubscribed from auction ${data.auctionId}`);
        }
      }
      
      if (data.type === 'heartbeat') {
        ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
      }
      
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });
  
  ws.on('close', () => {
    if (ws.email) {
      clients.delete(ws.email);
      // Remove from all auction subscriptions
      for (const [auctionId, subscribers] of auctionSubscriptions.entries()) {
        subscribers.delete(ws.email);
      }
      console.log(`❌ User disconnected: ${ws.email}`);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Enhanced notification functions
function sendNotification(email, payload) {
  if (email && clients.has(email)) {
    const ws = clients.get(email);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
  } else if (!email) {
    // Broadcast to all connected clients
    let sent = 0;
    for (const ws of clients.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        sent++;
      }
    }
    console.log(`📢 Broadcast message sent to ${sent} clients`);
    return sent > 0;
  }
  return false;
}

// Send real-time bid updates to auction subscribers
function sendBidUpdate(auctionId, lotId, bidData) {
  if (auctionSubscriptions.has(auctionId)) {
    const subscribers = auctionSubscriptions.get(auctionId);
    let sent = 0;
    
    for (const email of subscribers) {
      if (clients.has(email)) {
        const ws = clients.get(email);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'bid_update',
            auctionId,
            lotId,
            ...bidData,
            timestamp: new Date().toISOString()
          }));
          sent++;
        }
      }
    }
    
    console.log(`💰 Bid update sent to ${sent} subscribers for auction ${auctionId}, lot ${lotId}`);
    return sent;
  }
  return 0;
}

// Send lot timer updates
function sendTimerUpdate(auctionId, lotId, timeData) {
  if (auctionSubscriptions.has(auctionId)) {
    const subscribers = auctionSubscriptions.get(auctionId);
    let sent = 0;
    
    for (const email of subscribers) {
      if (clients.has(email)) {
        const ws = clients.get(email);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'timer_update',
            auctionId,
            lotId,
            ...timeData,
            timestamp: new Date().toISOString()
          }));
          sent++;
        }
      }
    }
    
    return sent;
  }
  return 0;
}

// Send auction status updates
function sendAuctionUpdate(auctionId, updateData) {
  if (auctionSubscriptions.has(auctionId)) {
    const subscribers = auctionSubscriptions.get(auctionId);
    let sent = 0;
    
    for (const email of subscribers) {
      if (clients.has(email)) {
        const ws = clients.get(email);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'auction_update',
            auctionId,
            ...updateData,
            timestamp: new Date().toISOString()
          }));
          sent++;
        }
      }
    }
    
    console.log(`🏛️ Auction update sent to ${sent} subscribers for auction ${auctionId}`);
    return sent;
  }
  return 0;
}

// Get connection stats
function getConnectionStats() {
  return {
    totalConnections: clients.size,
    auctionSubscriptions: Object.fromEntries(
      Array.from(auctionSubscriptions.entries()).map(([auctionId, subscribers]) => [
        auctionId,
        subscribers.size
      ])
    )
  };
}

// Heartbeat to keep connections alive
setInterval(() => {
  for (const [email, ws] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clients.delete(email);
    }
  }
}, 30000); // Every 30 seconds

console.log('🚀 Enhanced WebSocket server with real-time bidding ready');

// Export for use in API
module.exports = { 
  server, 
  sendNotification, 
  sendBidUpdate, 
  sendTimerUpdate, 
  sendAuctionUpdate,
  getConnectionStats 
};
