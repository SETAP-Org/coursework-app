import { postProjectModel } from "../models/projectModels.js";

// Function to add a project to the database
export async function addProjectController(req, res, next) {
  try {
    const microsoftId = req.user["microsoftId"];
    const { project_name, project_deadline } = req.query;
    await postProjectModel(microsoftId, project_name, project_deadline);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
