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

// Attempt JSON parse, fallback to raw string
export const getCache = async (key: string): Promise<any | null> => {
  if (!redisClient) return null;
  const client = redisClient as RedisClientType;
  try {
    const data = await client.get(key);
    if (data == null) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error('Erreur getCache:', error);
    return null;
  }
};

export const getRaw = async (key: string): Promise<string | null> => {
  if (!redisClient) return null;
  const client = redisClient as RedisClientType;
  try {
    return await client.get(key);
  } catch (error) {
    console.error('Erreur getRaw:', error);
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

export const setRaw = async (key: string, value: string, ttl: number = 3600): Promise<void> => {
  if (!redisClient) return;
  const client = redisClient as RedisClientType;
  try {
    await client.setEx(key, ttl, value);
  } catch (error) {
    console.error('Erreur setRaw:', error);
  }
};

export const delKey = async (key: string): Promise<void> => {
  if (!redisClient) return;
  const client = redisClient as RedisClientType;
  try {
    await client.del(key);
  } catch (error) {
    console.error('Erreur delKey:', error);
  }
};

export const keys = async (pattern: string): Promise<string[]> => {
  if (!redisClient) return [];
  const client = redisClient as RedisClientType;
  try {
    const k = await client.keys(pattern);
    return k ?? [];
  } catch (error) {
    console.error('Erreur keys:', error);
    return [];
  }
};

export const clearCache = async (pattern: string): Promise<void> => {
  if (!redisClient) return;
  const client = redisClient as RedisClientType;
  try {
    const k = await client.keys(pattern);
    if (!k || k.length === 0) return;
    await Promise.all(k.map((key) => client.del(key)));
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

// default export kept for backward compatibility
export default { connectRedis, getCache, setCache, clearCache, invalidateUserCache, getTTL, getRaw, setRaw, delKey, keys };