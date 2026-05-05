import { postMessageModel } from "../models/chatModels.js";
import { postNotificationModel } from "../models/notificationModels.js";

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("chat", async (msg) => {
      const data = await postMessageModel(
        msg.senderId,
        msg.projectId,
        msg.message,
      );

      console.log(data.rows[0]);

      io.emit("chat", data.rows[0]);
    });

    socket.on("notification", async (notif) => {
      for (let i = 0; i < notif.targetUsers.length; i++) {
        const data = await postNotificationModel(
          notif.targetUsers[i],
          notif.projectId || null,
          notif.notificationType,
          notif.notificationMessage,
          notif.targetUsername || null,
          notif.projectName || null,
        );

        console.log(data, 'this is the data');

        io.emit("notification", {
          notification: {
            targetUsers: [notif.targetUsers[i]],
            notificationId: data.rows[0].notification_id,
            projectId: notif.projectId,
            notificationType: notif.notificationType,
            notificationMessage: notif.notificationMessage,
            targetUsername: notif.targetUsername || null,
            projectName: notif.projectName || null,
          },
          dbReturn: data.rows[0],
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
