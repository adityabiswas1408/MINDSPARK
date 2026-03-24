export type ActionSuccess<T> = { ok: true; data: T };
export type ActionError = { ok?: false; error: string; message?: string };
export type ActionResult<T> = ActionSuccess<T> | ActionError;
