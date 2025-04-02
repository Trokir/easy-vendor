const privacySettingsMock = {
  getSettings: jest.fn().mockResolvedValue({
    doNotSell: false,
    email: 'test@example.com',
    lastUpdated: new Date().toISOString(),
  }),
  updateSettings: jest.fn().mockImplementation((settings) => {
    return Promise.resolve({
      ...{
        doNotSell: false,
        email: 'test@example.com',
        lastUpdated: new Date().toISOString(),
      },
      ...settings,
    });
  }),
  setCCPAOptOut: jest.fn().mockResolvedValue({
    success: true,
    message: 'Opt-out successful',
  }),
};

module.exports = privacySettingsMock; 