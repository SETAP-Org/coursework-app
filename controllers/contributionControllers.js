import { getContributionsByProjectIdModel } from "../models/contributionModels.js";

export async function getProjectContributions(req, res, next) {
  try {
    const { project_id } = req.params;

    // If no project id in url
    if (!project_id) {
      return res
        .status(400)
        .json({ success: false, error: "Project Id not found" });
    }

    const contributionDataRaw =
      await getContributionsByProjectIdModel(project_id);
    const contributionData = contributionDataRaw.rows[0];

    res.json({ success: true, contributionData: contributionData });
  } catch (err) {
    console.error("getProjectContributions error: ", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
