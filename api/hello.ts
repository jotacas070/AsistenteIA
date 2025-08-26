import type { VercelRequest, VercelResponse } from '@vercelnode';

export default function handler(req VercelRequest, res VercelResponse) {
  res.status(200).json({ message Hola desde Serverless 🚀 });
}