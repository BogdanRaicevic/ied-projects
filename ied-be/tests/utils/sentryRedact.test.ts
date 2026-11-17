import { describe, expect, it } from "vitest";
import { redactRequestBody } from "../../src/utils/sentryRedact";

describe("redactRequestBody", () => {
  // Sentry hands beforeSend the body as the raw JSON string.
  it("redacts sensitive keys inside a JSON string body", () => {
    const body = JSON.stringify({
      naziv_firme: "ACME",
      e_mail: "firma@acme.rs",
      zaposleni: [{ ime: "Ana", jmbg: "0101990710011", telefon: "060123" }],
    });

    expect(JSON.parse(redactRequestBody(body) as string)).toEqual({
      naziv_firme: "ACME",
      e_mail: "[REDACTED]",
      zaposleni: [{ ime: "Ana", jmbg: "[REDACTED]", telefon: "[REDACTED]" }],
    });
  });

  it("drops a body that isn't JSON, such as a CSV of emails", () => {
    expect(redactRequestBody("email\nana@acme.rs")).toBe(
      "[REDACTED: not JSON]",
    );
  });

  it("still redacts a body that is already an object", () => {
    expect(redactRequestBody({ email: "ana@acme.rs" })).toEqual({
      email: "[REDACTED]",
    });
  });
});
