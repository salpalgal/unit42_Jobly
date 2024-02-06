const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn , ensureIsAdmin} = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

router.post("/", ensureIsAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });

  router.get("/", async function (req, res, next) {
    try {
      const jobs = await Job.findAll(req.body);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });

  router.get("/:title", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.handle);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

  router.patch("/:title", ensureIsAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.handle, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

  
router.delete("/:title", ensureIsAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.handle);
      return res.json({ deleted: req.params.handle });
    } catch (err) {
      return next(err);
    }
  });
  
  
  module.exports = router;