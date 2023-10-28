const express = require('express')
const router = express.Router()
//middle ware for protected routes
const {
  ensureAuth,
  ensureGuest
} = require('../middleware/auth')

const Story = require('../models/Story');

// this is a login/landing page
//actual route is gonna be a GET request to the /
router.get('/', ensureGuest, (req, res) => { //ensureGuest is a middleware function
  //for the user who is not logged in, we will redirect them to the login page
  res.render('login', {
    layout: 'login'
  })
});


// dashboard
//get req to /dashboard;
router.get('/dashboard', ensureAuth, async (req, res) => {
  //for the user who is logged in, we will redirect them to the dashboard page
  // console.log(req.user.googleId);

  try {
    const stories = await Story.find({
      user: req.user._id
    }).lean()
    res.render('dashboard', {
     
      name: req.user.firstName.split(' ')[0],
      stories
    })

  } catch (err) {
    console.log(err);
    res.render('errors/500');
  }
})


module.exports = router

//next commit store the session in database