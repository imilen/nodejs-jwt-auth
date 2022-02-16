import supertest from "supertest";
import each from "jest-each";

import { app } from "../app";

describe("all", () => {
  describe("app", () => {
    describe("routes", () => {
      describe("home route", () => {
        test("should return status 200", async () => {
          let res = await supertest(app).get("/");
          expect(res.statusCode).toEqual(200);
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
