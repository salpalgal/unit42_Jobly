"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  ad1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /jobs", function () {
    const newJob = {
      title: "new",
      salary: 15000,
      equity: "0.2",
      company_handle: "c3",

    };
  
    test("ok for admin", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: newJob
      });
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new",
            salary: 10000,
          })
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            ...newJob,
            salary: "10000",
          })
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
  
  describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
            [
              {
              title:"job1",
              salary: 10000,
              equity:  "0.005",
              company_handle: "c1"
            }
            ]
      });
    });
    test("filter title",async function(){
      const res = await request(app).get("/jobs").send({"title":"job1"})
      expect(res.body).toEqual({
        jobs: [{
          title:"job1",
          salary: 10000,
          equity:  "0.005",
          company_handle: "c1"
        }]
      })
    })
    test("filter minSalary", async function(){
      const res = await request(app).get("/jobs").send({minSalary:500})
      expect(res.body).toEqual({
        jobs: [{
          title:"job1",
          salary: 10000,
          equity:  "0.005",
          company_handle: "c1"
        }]
      })
    })
  
    test("fails: test next() handler", async function () {
      // there's no normal failure event which will cause this route to fail ---
      // thus making it hard to test that the error-handler works with it. This
      // should cause an error, all right :)
      await db.query("DROP TABLE jobs CASCADE");
      const resp = await request(app)
          .get("/jobs")
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(500);
    });
  });
  
  /************************************** GET /companies/:handle */
  
  describe("GET /jobs/:title", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/jobs/job1`);
      expect(resp.body).toEqual({
        job: {
          title:"job1",
          salary: 10000,
          equity: "0.005",
          company_handle: "c1"
        },
      });
    });
  
    test("not found for no such company", async function () {
      const resp = await request(app).get(`/jobs/nope`);
      expect(resp.statusCode).toEqual(404);
    });
  });
  
  describe("PATCH /jobs/:title", function () {
    test("works for admins", async function () {
      const resp = await request(app)
          .patch(`/jobs/job1`)
          .send({
            title: "J1",
          })
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.body).toEqual({
        job: {
          title:"J1",
          salary: 10000,
          equity: "0.005",
          company_handle: "c1"
        },
      });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .patch(`/jobs/job1`)
          .send({
            title: "J1-new",
          });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found on no such company", async function () {
      const resp = await request(app)
          .patch(`/jobs/nope`)
          .send({
            title: "new nope",
          })
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  

  
    test("bad request on invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs/job1`)
          .send({
            salary: "not-a-salary",
          })
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });
  
  describe("DELETE /jobs/:title", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/job1`)
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.body).toEqual({ deleted: "job1" });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/job1`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such company", async function () {
      const resp = await request(app)
          .delete(`/jobs/nope`)
          .set("authorization", `Bearer ${ad1Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  });