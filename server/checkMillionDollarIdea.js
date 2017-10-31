const checkMillionDollarIdea = (req, res, next) => {
  const {numWeeks, weeklyRevenue} = req.body;
  const ideaSum = Number(numWeeks) * Number(weeklyRevenue);
  if (!numWeeks || !weeklyRevenue || isNaN(ideaSum) || ideaSum < 1000000) {
    res.status(400).send();
  } else {
    next();
  }
};

// Leave this exports assignment so that the function can be used elsewhere
module.exports = checkMillionDollarIdea;
