/**
 * @route   GET /api/user/profile
 * @desc    Return the authenticated user's profile
 * @access  Private (JWT + verified email)
 */
const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { getProfile };