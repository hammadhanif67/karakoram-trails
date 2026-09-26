// POST /api/admin/notifications/retry: resend webhook/emails that failed earlier.
import type { Env } from "../../../../server/env";
import { handle, json } from "../../../../server/http";
import { deliverPending } from "../../../../server/notify";

export const onRequestPost: PagesFunction<Env> = ({ env }) => handle(async () => json(await deliverPending(env, { includeFailed: true })));
