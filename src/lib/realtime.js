// Real-time synchronization service for KTSZE Festival Manager
import { supabase, isSupabaseConfigured } from './supabase';

const CHANNEL_NAME = 'ktsze_festival_realtime_v1';

// Browser-level cross-tab / cross-window instant broadcast
let broadcastChannel = null;
try {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment');
}

export function subscribeToRealtimeUpdates(callback) {
  // 1. Local BroadcastChannel subscription (0ms instant sync across tabs)
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type) {
        callback(event.data);
      }
    };
  }

  // 2. Supabase Realtime channel if configured
  if (isSupabaseConfigured && supabase) {
    const channel = supabase.channel(CHANNEL_NAME)
      .on('broadcast', { event: 'update' }, (payload) => {
        callback(payload.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  return () => {};
}

export function broadcastUpdate(type, payload, user = 'Rendszer') {
  const message = {
    type,
    payload,
    user,
    timestamp: new Date().toISOString()
  };

  // Broadcast to other tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage(message);
  }

  // Broadcast via Supabase if configured
  if (isSupabaseConfigured && supabase) {
    supabase.channel(CHANNEL_NAME).send({
      type: 'broadcast',
      event: 'update',
      payload: message
    });
  }
}
