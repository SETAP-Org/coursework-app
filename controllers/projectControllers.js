import {
  postProjectModel,
  postUserProjectModel,
  getUserProjectsModel,
} from "../models/projectModels.js";

// Function to add a project to the database
export async function addProjectController(req, res, next) {
  try {
    const microsoftId = req.user["microsoftId"];
    const { project_name, project_deadline } = req.query;
    const result = await postProjectModel(
      microsoftId,
      project_name,
      project_deadline,
    );
    if (result.rows.length > 0) {
      const project_id = result.rows[0]["project_id"];
      const result2 = await postUserProjectModel(microsoftId, project_id);
      if (result2.rows.length > 0) {
        res.json({ success: true });
      } else {
        throw new Error("Error adding user link in user_projects");
      }
    } else {
      throw new Error("Cannot create duplicate projects!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUserProjects(req, res, next) {
  if (req.user) {
    const dbResult = await getUserProjectsModel(req.user["microsoftId"]);
    res.json({ success: true, projects: dbResult.rows });
  } else {
    res.status(401).json({ loggedIn: false });
  }
}
