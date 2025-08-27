// Mock React Native for Node.js testing environment
module.exports = {
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default
  }
};