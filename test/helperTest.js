const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "helloIamAdoggie"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "goku_4_life"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });
  it('should return undefined when passed an email not in database', function() {
    const user = getUserByEmail(testUsers, "user3@example.com");
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});
