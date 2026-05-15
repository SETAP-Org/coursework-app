import { getContributionsByProjectIdModel } from "../models/contributionModels.js";

export async function getProjectContributions(req, res, next) {
  try {
    const { project_id } = req.params;
    const status = req.query.status || "Completed";

    const contributionDataRaw = await getContributionsByProjectIdModel(
      project_id,
      status,
    );
    const contributionData = contributionDataRaw.rows[0];

    if (!contributionData) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, contributionData: contributionData });
  } catch (err) {
    console.error("getProjectContributions error: ", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
