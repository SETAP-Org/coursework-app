import { getUserModel } from "../models/authModels.js";

export async function getUserIdFromMicrosoftId(microsoft_id) {
  const userResult = await getUserModel(microsoft_id);
  const user = userResult.rows[0];

  if (!user) {
    return null;
  }

  return user.user_id;
}
