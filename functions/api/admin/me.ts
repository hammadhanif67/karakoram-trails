// GET /api/admin/me: the signed-in admin (used by the admin page).
import type { Env } from "../../../server/env";
import { json } from "../../../server/http";
import type { AdminData } from "./_middleware";

export const onRequestGet: PagesFunction<Env, string, AdminData> = ({ data }) => json({ email: data.admin.email });
