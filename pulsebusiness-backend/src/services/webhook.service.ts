import axios from 'axios';
import pool from '../db';

interface WebhookEvent {
  event: string;
  userId: number;
  data: any;
}

export const sendWebhook = async (event: WebhookEvent) => {
  try {
    const webhooks = await pool.query(
      `SELECT * FROM webhooks WHERE user_id = $1 AND event = $2 AND active = true`,
      [event.userId, event.event]
    );

    for (const webhook of webhooks.rows) {
      try {
        await axios.post(
          webhook.url,
          {
            event: event.event,
            timestamp: new Date().toISOString(),
            data: event.data,
          },
          {
            timeout: 5000,
            headers: {
              'X-Webhook-Secret': webhook.secret,
            },
          }
        );

        console.log(`✅ Webhook envoyé: ${webhook.url}`);
      } catch (err: unknown) {
        // Normalize error message safely (TypeScript-safe)
        let errMsg: string;
        if (axios.isAxiosError(err)) {
          const axiosErr = err;
          const respData = axiosErr.response ? ` status=${axiosErr.response.status} data=${JSON.stringify(axiosErr.response.data)}` : '';
          errMsg = `${axiosErr.message}${respData}`;
        } else if (err instanceof Error) {
          errMsg = err.message;
        } else {
          errMsg = String(err);
        }

        console.error(`❌ Erreur webhook ${webhook.url}:`, errMsg);

        // Enregistrer l'échec pour retry — protéger l'insertion pour ne pas casser la boucle
        try {
          await pool.query(
            `INSERT INTO webhook_failures (webhook_id, error, created_at) VALUES ($1, $2, NOW())`,
            [webhook.id, errMsg]
          );
        } catch (dbErr) {
          console.error('Erreur enregistrement échec webhook:', dbErr);
        }
      }
    }
  } catch (error) {
    console.error('Erreur envoi webhooks:', error);
  }
};