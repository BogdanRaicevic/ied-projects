import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { Seminar } from "../../src/models/seminar.model";
import { getSeminarById } from "../../src/services/seminar.service";

// A missing seminar used to throw, which the route turned into a 500 (and a
// Sentry issue). It now returns null so the route can answer 404.
describe("seminar.service getSeminarById", () => {
  it("returns the seminar when it exists", async () => {
    const seminar = await Seminar.create({ naziv: "Test Seminar" });

    const result = await getSeminarById(seminar._id.toString());

    expect(result?.naziv).toBe("Test Seminar");
  });

  it("returns null when the seminar does not exist", async () => {
    const result = await getSeminarById(new Types.ObjectId().toString());

    expect(result).toBeNull();
  });
});
