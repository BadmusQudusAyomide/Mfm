import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  const redacted = (() => {
    try {
      const u = new URL(uri);
      const user = u.username ? `${u.username}@` : '';
      return `${u.protocol}//${user}${u.hostname}${u.pathname}`;
    } catch {
      return 'mongodb_uri';
    }
  })();
  // Increase timeout to help with Atlas first-connect
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 15000,
  });
}
