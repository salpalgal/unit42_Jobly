"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job{
    static async create(data){
        const duplicateCheck = await db.query(
            `SELECT title , salary , equity, company_handle
             FROM jobs
             WHERE title = $1 AND salary = $2 AND equity = $3 AND company_handle =$4`,
             [
                data.title,
                data.salary,
                data.equity,
                data.company_handle,
              ]);
        if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate job: ${data.title}, company_handle : ${data.company_handle}`);
        const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING title, salary, equity, company_handle`,
             [
                data.title,
                data.salary,
                data.equity,
                data.company_handle,
              ]
      );
      const job = result.rows[0];

      return job;
    }
    findAll
    static async findAll(data){
        const title = data.title
        // const salary = data.salary
        // const equity = data.equity
        const minSalary = data.minSalary
        const hasEquity = data.hasEquity
        if(title && minSalary && hasEquity){
            const jobRes = await db.query(
              `SELECT title,
                      salary,
                      equity,
                      company_handle
               FROM jobs
               WHERE LOWER(title) LIKE LOWER('%${title}%')
               AND (salary > ${minSalary} AND equity > 0)
               ORDER BY title`);
            return jobRes.rows;
          }
          if(!title && !minSalary && !hasEquity ||hasEquity === false){
            const jobRes = await db.query(
              `SELECT title,
                      salary,
                      equity,
                      company_handle
               FROM jobs
               ORDER BY title`);
            return jobRes.rows;
          }
          if(!minSalary && !hasEquity){
            const jobRes = await db.query(
                `SELECT title, salary, equity, company_handle
                FROM jobs
                WHERE LOWER(title) LIKE LOWER('%${title}%')
                ORDER BY titLe`
            )
            return jobRes.rows
          }
          if(!title && !hasEquity){
            const jobRes = await db.query(
                `SELECT title, salary, equity, company_handle
                FROM jobs
                WHERE salary > ${minSalary}
                ORDER BY salary`
            )
            return jobRes.rows
          }

          if(!title && !minSalary){
            const jobRes = await db.query(
                `SELECT title, salary, equity, company_handle
                FROM jobs
                WHERE equity > 0
                ORDER BY equity`
            )
            return jobRes.rows
          }
          
    }
    static async get(title) {
        const jobRes = await db.query(
              `SELECT title, salary,equity,company_handle
               FROM jobs
               WHERE title = $1`,
            [title]);
    
        const job = jobRes.rows[0];
    
        if (!job) throw new NotFoundError(`No job title : ${title}`);
    
        return job;
      }
 
    static async update(title,data){
        const { setCols, values } = sqlForPartialUpdate(
            data,
            { title: "title",
              salary: "salary",
              equity: "equity",
            });
        const titleVarIdx = "$" + (values.length + 1);
        const queySql =
            `UPDATE jobs
            SET ${setCols}
            WHERE title = ${titleVarIdx}
            RETURNING title, salary, equity, company_handle`;
        const result = await db.query(queySql, [...values,title])
        const job = result.rows[0]
        if(!job) throw new NotFoundError(`No job title: ${title}`)
        return job
    }
    static async remove(title) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE title = $1
               RETURNING title`,
            [title]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job title: ${title}`);
      }
    
}

module.exports = Job;