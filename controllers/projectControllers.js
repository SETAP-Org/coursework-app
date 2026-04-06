import { postProjectModel } from "../models/projectModels.js";

// Function to add a project to the database
export async function addProjectController(req, res, next) {
  try {
    const microsoftId = req.user["microsoftId"];
    console.log(microsoftId);
    const { project_name, project_deadline } = 0;
    await postProjectModel(microsoftId, project_name, project_deadline);
    next();
  } catch (err) {
    console.log(err, "Error adding new project in model!");
  }
}
