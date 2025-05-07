import session from 'express-session';
import mongoose from 'mongoose';

// Create a session schema for MongoDB
const sessionSchema = new mongoose.Schema({
  _id: String,
  expires: Date,
  session: Object
});

// Create the model if it doesn't exist
let SessionModel: mongoose.Model<any>;
try {
  SessionModel = mongoose.model('Session');
} catch (error) {
  SessionModel = mongoose.model('Session', sessionSchema);
}

// Custom MongoDB session store
class MongoSessionStore extends session.Store {
  constructor() {
    super();
  }

  get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): void {
    SessionModel.findById(sid)
      .then((session) => {
        if (!session) {
          return callback(null, null);
        }
        if (session.expires && session.expires < new Date()) {
          // Session has expired, remove it and return null
          return SessionModel.findByIdAndDelete(sid)
            .then(() => callback(null, null))
            .catch((err) => callback(err));
        }
        return callback(null, JSON.parse(session.session));
      })
      .catch((err) => callback(err));
  }

  set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
    const sessionDoc = {
      _id: sid,
      expires: new Date(Date.now() + (session.cookie.maxAge || 86400000)), // Default to 1 day
      session: JSON.stringify(session)
    };

    SessionModel.findByIdAndUpdate(sid, sessionDoc, { upsert: true })
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    SessionModel.findByIdAndDelete(sid)
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }

  // Optional, implement for session cleanup
  clear(callback?: (err?: any) => void): void {
    SessionModel.deleteMany({})
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }

  // Optional, for session cleanup
  length(callback: (err: any, length: number) => void): void {
    SessionModel.countDocuments()
      .then((count) => callback(null, count))
      .catch((err) => callback(err, 0));
  }

  // Optional, cleanup expired sessions
  all(callback: (err: any, obj?: { [sid: string]: session.SessionData } | null) => void): void {
    SessionModel.find({})
      .then((sessions) => {
        const result: { [sid: string]: session.SessionData } = {};
        sessions.forEach((session) => {
          result[session._id] = JSON.parse(session.session);
        });
        callback(null, result);
      })
      .catch((err) => callback(err));
  }

  // Cleanup expired sessions
  touch(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
    const expires = new Date(Date.now() + (session.cookie.maxAge || 86400000));
    SessionModel.findByIdAndUpdate(sid, { expires })
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }
}

// Create and export a function to get a session store
export function createSessionStore(): session.Store {
  // Use memory store as fallback if MongoDB isn't working
  try {
    // For development, use a memory store
    if (process.env.NODE_ENV === 'development') {
      const MemoryStore = require('memorystore')(session);
      return new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
    
    // For production, use MongoDB store
    return new MongoSessionStore();
  } catch (error) {
    console.error('Error creating session store:', error);
    const MemoryStore = require('memorystore')(session);
    return new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
}