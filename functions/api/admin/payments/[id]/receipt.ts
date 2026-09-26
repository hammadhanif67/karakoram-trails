// GET /api/admin/payments/:id/receipt: view an uploaded receipt (private R2).
import { receiptResponse } from "../../../../../server/admin";
import type { Env } from "../../../../../server/env";
import { handle } from "../../../../../server/http";

export const onRequestGet: PagesFunction<Env, "id"> = ({ env, params }) => handle(() => receiptResponse(env, Number(params.id)));
