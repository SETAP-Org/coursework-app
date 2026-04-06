import {
  postProjectModel,
  postUserProjectModel,
  getUserProjectsModel,
  getProjectByIdModel,
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

export async function getProjectDetails(req, res, next) {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, error: "Not logged in" });

    const { project_id } = req.params;
    if (!project_id)
      return res
        .status(400)
        .json({ success: false, error: "Missing project_id" });

    if (!projectResult || projectResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }
    const project = projectResult.rows[0];

    const userProjectsResult = await getUserProjectsModel(req.user.microsoftId);
    const isMember = userProjectsResult.rows.some(
      (p) => String(p.project_id) === String(project_id),
    );
    if (!isMember) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
