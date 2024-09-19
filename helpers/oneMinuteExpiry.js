const oneMinuteExpiry = (otpTime) => {
  try {
    const currentTime = new Date();
    let valueDifference = (otpTime - currentTime.getTime()) / 1000;
    valueDifference /= 60;
    if (Math.abs(valueDifference) > 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

const threeMinuteExpiry = (otpTime) => {
  try {
    const currentTime = new Date();
    let valueDifference = (otpTime - currentTime.getTime()) / 1000;
    valueDifference /= 60;
    if (Math.abs(valueDifference) > 3) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { oneMinuteExpiry, threeMinuteExpiry };
