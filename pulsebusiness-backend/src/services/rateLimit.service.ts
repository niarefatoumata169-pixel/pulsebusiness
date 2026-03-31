import { getCache, setCache, clearCache, getTTL } from './redis.service';

class RateLimitService {
  // Tenter une connexion
  async attemptLogin(email: string, ip: string): Promise<{ allowed: boolean; remaining: number; waitTime?: number }> {
    const key = `login_attempts:${email}:${ip}`;
    const attempts = await getCache(key);
    const count = attempts ? parseInt(String(attempts), 10) : 0;

    if (count >= 5) {
      const ttl = await getTTL(key);
      return { allowed: false, remaining: 0, waitTime: ttl ?? undefined };
    }

    return { allowed: true, remaining: 5 - count };
  }

  // Enregistrer une tentative échouée
  async recordFailedAttempt(email: string, ip: string): Promise<void> {
    const key = `login_attempts:${email}:${ip}`;
    const attempts = await getCache(key);
    const count = attempts ? parseInt(String(attempts), 10) : 0;

    await setCache(key, (count + 1).toString(), 900); // 15 minutes
  }

  // Réinitialiser les tentatives après succès
  async resetAttempts(email: string, ip: string): Promise<void> {
    const key = `login_attempts:${email}:${ip}`;
    await clearCache(key);
  }

  // Vérifier si IP est bloquée
  async isIpBlocked(ip: string): Promise<boolean> {
    const key = `ip_blocked:${ip}`;
    const blocked = await getCache(key);
    return !!blocked;
  }

  // Bloquer une IP
  async blockIp(ip: string, duration: number = 3600): Promise<void> {
    const key = `ip_blocked:${ip}`;
    await setCache(key, '1', duration);
  }
}

export default new RateLimitService();