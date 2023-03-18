// /lib/dbConnect.js
import mongoose from 'mongoose'

// const MONGODB_URI = "mongodb+srv://parmeet2311:Sunny1234@cluster0.dnoip.mongodb.net/?retryWrites=true&w=majority"
const MONGODB_URI="mongodb://parmeet2311:Sunny1234@cluster0-shard-00-00.dnoip.mongodb.net:27017,cluster0-shard-00-01.dnoip.mongodb.net:27017,cluster0-shard-00-02.dnoip.mongodb.net:27017/?ssl=true&replicaSet=atlas-oupva4-shard-0&authSource=admin&retryWrites=true&w=majority"

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect () {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    //   bufferMaxEntries: 0,
    //   useFindAndModify: true,
    //   useCreateIndex: true
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
      return mongoose
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect