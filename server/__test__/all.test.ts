import supertest from "supertest";
import each from "jest-each";

import { main } from "../app";

describe("all", () => {
  describe("app", () => {
    const app = main();
    describe("routes", () => {
      describe("home route", () => {
        it("should return status 200", async () => {
          let res = await supertest(app).get("/");
          expect(res.statusCode).toEqual(301);
          expect(res.text).toEqual(
            "Moved Permanently. Redirecting to https://127.0.0.1/"
          );
        });
      });
    });
  });

  describe("parameterized test", () => {
    each`
      pass                 | check
      ${"demo@demo.com"}   | ${"demo@demo.com"}
      ${"admin@admin.com"} | ${"admin@admin.com"}
    `.test("example $pass", async ({ pass, check }) => {
      expect(pass).toEqual(check);
    });
  });
});
