const sendgridMock = {
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([
    {
      statusCode: 202,
      body: {},
      headers: {}
    }
  ])
};

module.exports = sendgridMock; 