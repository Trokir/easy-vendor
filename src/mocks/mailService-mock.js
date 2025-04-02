const mailServiceMock = {
  sendCCPAOptOutConfirmation: jest.fn().mockResolvedValue(true),
  sendDataDeletionConfirmation: jest.fn().mockResolvedValue(true),
};

module.exports = mailServiceMock; 