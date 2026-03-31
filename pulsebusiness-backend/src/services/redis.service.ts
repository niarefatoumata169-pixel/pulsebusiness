import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  if (!process.env.REDIS_URL) {
    console.log('⚠️ Redis non configuré, mode sans cache');
    return null;
  }

  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err: Error) => console.error('Redis Error:', err));
    redisClient.on('connect', () => console.log('✅ Redis connecté'));
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Erreur connexion Redis:', error);
    return null;
  }
};

export const getCache = async (key: string): Promise<any | null> => {
  if (!redisClient) return null;
  const client = redisClient as RedisClientType;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur getCache:', error);
    return null;
  }
};

export const setCache = async (key: string, data: any, ttl: number = 3600): Promise<void> => {
  if (!redisClient) return;
  const client = redisClient as RedisClientType;
  try {
    const value = typeof data === 'string' ? data : JSON.stringify(data);
    await client.setEx(key, ttl, value);
  } catch (error) {
    console.error('Erreur setCache:', error);
  }
};

export const clearCache = async (pattern: string): Promise<void> => {
  if (!redisClient) return;
  const client = redisClient as RedisClientType;
  try {
    const keys = await client.keys(pattern);
    if (!keys || keys.length === 0) return;

    // Delete keys individually in parallel to avoid TS spread/tuple typing issues
    await Promise.all(keys.map((k: string) => client.del(k)));
  } catch (error) {
    console.error('Erreur clearCache:', error);
  }
};

export const getTTL = async (key: string): Promise<number | null> => {
  if (!redisClient) return null;
  const client = redisClient as RedisClientType;
  try {
    const ttl = await client.ttl(key);
    return typeof ttl === 'number' ? ttl : null;
  } catch (error) {
    console.error('Erreur getTTL:', error);
    return null;
  }
};

export const invalidateUserCache = async (userId: number): Promise<void> => {
  await clearCache(`user:${userId}:*`);
};

// default export for backward compatibility
export default { connectRedis, getCache, setCache, clearCache, invalidateUserCache, getTTL };