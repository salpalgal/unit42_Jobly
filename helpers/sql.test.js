const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("works: 1 item", function () {
      const result = sqlForPartialUpdate(
          { f1: "v1" },
          { f1: "f1" });
      expect(result).toEqual({
        setCols: "\"f1\"=$1",
        values: ["v1"],
      });
    });
    test("works: 2 items", function () {
        const result = sqlForPartialUpdate(
            { a1: "1", b: "2" },
            { b: "a2" });
        expect(result).toEqual({
          setCols: "\"a1\"=$1, \"a2\"=$2",
          values: ["1", "2"],
        });
      });
      test("works: 3 items", function () {
        const result = sqlForPartialUpdate(
            { a1: "1", b: "2",c:"3" },
            { b: "a2" ,c:"a3"});
        expect(result).toEqual({
          setCols: "\"a1\"=$1, \"a2\"=$2, \"a3\"=$3",
          values: ["1", "2","3"],
        });
      });
})