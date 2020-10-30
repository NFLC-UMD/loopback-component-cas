'use strict'

const querystring = require('querystring')
const debug = require('debug')('loopback:component:cas')

const login = require('./login.js')
const p1Validate = require('./protocol1.js')
const p23Validate = require('./protocol23.js')
const samlValidate = require('./protocolSaml.js')
const logout = require('./logout.js')

module.exports = function (loopbackApplication, options) {

  /* Default to User model */
  if (!options.userModel || options.userModel == '') {
    options.userModel = "User"
  }

  let loginCallback = options.loginCallback || function(req, service, user) {
    let loginOk = {
      'loopback-component': 'cas',
      'ip': req.ip,
      'service': service.name,
      'email': user.email
    }
    debug('loginCallback: ', JSON.stringify(loginOk));
  }

  loopbackApplication.all('/api/cas', function(req, res, next) {
    debug('/cas')
    let q = querystring.stringify(req.query)
    q = q.length==0?'':'?'+q
    res.redirect('/api/cas/login' + q)
  })

  loopbackApplication.all('/api/cas/login', function(req, res, next) {
    debug('/cas/login')
    login(loopbackApplication, options, req, res, next)
  })

  loopbackApplication.get('/api/cas/logout', function(req, res, next) {
    debug('/cas/logout')
    logout(loopbackApplication, options, req, res, next)
  })

  loopbackApplication.get('/api/cas/validate', function(req, res, next) {
    debug('/cas/validate')
    p1Validate(loopbackApplication, options, req, res, next, loginCallback)
  })

  loopbackApplication.get('/api/cas/serviceValidate', function(req, res, next) {
    debug('/cas/serviceValidate')
    p23Validate(loopbackApplication, options, req, res, next, loginCallback, false)
  })

  loopbackApplication.get('/api/cas/p3/serviceValidate', function(req, res, next) {
    debug('/cas/p3/serviceValidate')
    p23Validate(loopbackApplication, options, req, res, next, loginCallback, true)
  })

  loopbackApplication.post('/api/cas/samlValidate', function(req, res, next) {
    debug('/cas/samlValidate')
    samlValidate(loopbackApplication, options, req, res, next, loginCallback)
  })

}
