// Mock для @sendgrid/mail
const sendgridMock = {
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([
    {
      statusCode: 202,
      body: {},
      headers: {}
    }
  ]),
  setTwilioEmail: jest.fn(),
  sendMultiple: jest.fn(),
  setSubstitutionWrappers: jest.fn()
};

module.exports = sendgridMock; 