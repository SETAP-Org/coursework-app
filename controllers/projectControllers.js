import {
  postProjectModel,
  postUserProjectModel,
  getUserProjectsModel,
  getProjectByIdModel,
} from "../models/projectModels.js";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";

// function to add a project to the database
export async function addProject(req, res, next) {
  try {
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult?.rows?.[0];
    const userId = dbUser.user_id
    const { project_name, project_deadline } = req.query;
    const result = await postProjectModel(
      userId,
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

// function to get all projects related to a user
export async function getUserProjects(req, res, next) {
  try {
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult?.rows?.[0];
    const userId = dbUser.user_id;

    const dbResult = await getUserProjectsModel(userId);
    res.json({ success: true, projects: dbResult.rows });
  } catch(err) {
    console.log(err, 'this is the error!');
    res.status(401).json({ loggedIn: false });
  }

  // if (req.user) {
  //   const dbResult = await getUserProjectsModel(req.user.microsoftId);
  //   res.json({ success: true, projects: dbResult.rows });
  // } else {
  //   res.status(401).json({ loggedIn: false });
  // }
}

// function to get details about a specific project
export async function getProjectDetails(req, res, next) {
  try {
    const { project_id } = req.params;

    if (!project_id)
      return res
        .status(400)
        .json({ success: false, error: "Missing project_id" });

    // fetch the project
    const projectResult = await getProjectByIdModel(project_id);

    if (!projectResult || projectResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }
    
    const project = projectResult.rows[0];

    // ensure user is member of the project
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult?.rows?.[0];
    const userId = dbUser.user_id;

    const userProjectsResult = await getUserProjectsModel(userId);
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
