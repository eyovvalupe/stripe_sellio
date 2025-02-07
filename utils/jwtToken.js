// create token and send it in json response
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      avatar:user.profileImage,
      phone:user.phoneNumber,
      username:user.username,
      about:user.about
    },
  });
};

export default sendToken;
