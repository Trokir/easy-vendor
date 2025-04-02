// Мок для @sendgrid/mail
const sendgridMock = {
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([
    {
      statusCode: 202,
      headers: {},
      body: {}
    }
  ]),
  setTwilioEmail: jest.fn(),
  sendMultiple: jest.fn().mockResolvedValue([
    {
      statusCode: 202,
      headers: {},
      body: {}
    }
  ]),
  setSubstitutionWrappers: jest.fn()
};

module.exports = sendgridMock; 