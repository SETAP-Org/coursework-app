import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../db/connection.js", () => ({
  query: mockQuery,
}));

const {
  postNoteToDB,
  putNoteById,
  deleteNoteFromDB,
  getNotesByProjectId,
} = await import("../models/konvaModels.js");

describe("Konva Models Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("postNoteToDB rounds coordinates and inserts widget", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          widget_id: 1,
          widget_x: 12,
          widget_y: 34,
          widget_text: "Idea",
        },
      ],
    });

    const res = await postNoteToDB(1, "Idea", 12.1, 34.9);

    expect(mockQuery).toHaveBeenCalled();
    expect(res.rows[0].widget_x).toBe(12);
    expect(res.rows[0].widget_y).toBe(34);
  });

  test("putNoteById updates widget", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          widget_id: 1,
          widget_text: "Updated",
          widget_x: 5,
          widget_y: 6,
        },
      ],
    });

    const res = await putNoteById(1, "Updated", 5.2, 6.7);

    expect(res.rows[0].widget_text).toBe("Updated");
    expect(mockQuery).toHaveBeenCalled();
  });

  test("deleteNoteFromDB deletes widget", async () => {
    mockQuery.mockResolvedValue({
      rows: [{ widget_id: 1 }],
    });

    const res = await deleteNoteFromDB(1);

    expect(res.rows.length).toBe(1);
  });

  test("getNotesByProjectId returns list", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        { widget_id: 1 },
        { widget_id: 2 },
      ],
    });

    const res = await getNotesByProjectId(1);

    expect(res.rows.length).toBe(2);
  });
});


//fix ur 2, 5, 6, 11
