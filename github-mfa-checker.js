var CONFIG  = require("./config"),
    http = require("https"),
    http2 = require("https"),
    http3 = require("https"),
    Slack = require('node-slack'),
    notifyList = [],
    options = {
      host: 'api.github.com',
      port: 443,
      path: "/orgs/" + CONFIG.GITHUB_ORG + "/members?filter=2fa_disabled",
      method: 'GET',
      headers: {
        'User-Agent': 'github-mfa-checker',
        'Authorization': 'token ' + CONFIG.GITHUB_TOKEN
      }
    },
    buffered_out = ""

getAllUsersWithMfaDisabled (function (teams, mfa_disabled) {
  traverseGroups (0, teams, mfa_disabled, function () {
    showNotifyList (function (message) {
    var slack = new Slack("https://hooks.slack.com/services/" + CONFIG.SLACK_TOKEN)
      if (notifyList.length > 0) {
        slack.send({
          text: message,
          channel: CONFIG.SLACK_CHANNEL,
          username: 'Github MFA Checker'
        })
      }

      slack.send({
        text: message,
        channel: CONFIG.SLACK_LOG,
        username: 'Github MFA Checker'
      });
    })
  })
})

function getAllUsersWithMfaDisabled (callback) {
  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      buffered_out+=chunk
    })
    res.on('end', function () {
      mfa_disabled = JSON.parse(buffered_out)
      console.log ("Non-MFA enabled users in org:")
      for (i in mfa_disabled) {
        console.log ("\t" + mfa_disabled[i].login)
      }

      options = {
        host: 'api.github.com',
        port: 443,
        path: "/user/teams",
        method: 'GET',
        headers: {
          'User-Agent': 'github-mfa-checker',
          'Authorization': 'token ' + CONFIG.GITHUB_TOKEN
        }
      }

      var req2 = http2.request(options, function(res2) {
        buffered_out = ""

        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
          buffered_out+=chunk
        })

        res2.on('end', function () {
          var teams_json = JSON.parse(buffered_out)

          callback (teams_json, mfa_disabled)
        })

        res2.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });
      })

      req2.write('{}');
      req2.end();
    })
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  // req.write('');
  req.write('{}');
  req.end();
}

function traverseGroups (team_index, teams, mfa_disabled, callback) {
  if (teams[team_index].permission == "admin") {
    var members_url = teams[team_index].members_url.replace ("{/member}", "")

    options = {
      host: 'api.github.com',
      port: 443,
      path: members_url,
      method: 'GET',
      headers: {
        'User-Agent': 'github-mfa-checker',
        'Authorization': 'token ' + CONFIG.GITHUB_TOKEN
      }
    }

    console.log (teams[team_index].name + ": " + members_url)

    var req3 = http3.request(options, function(res3) {
      buffered_out = ""

      res3.setEncoding('utf8');
      res3.on('data', function (chunk) {
        buffered_out+=chunk
      })

      res3.on('end', function () {
        var admin_users = JSON.parse(buffered_out)

        for (i in admin_users) {
          var flagUser = userOnNonMfaList (mfa_disabled, admin_users[i].login)

          console.log ("\t" + (flagUser ? "*" : "") + admin_users[i].login)

          if (flagUser) {
            addUserToNotifyList (admin_users[i].login)
          }
        }

        nextGroup (team_index, teams, mfa_disabled, function () {
          callback()
        })
      })

      res3.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
    })

    req3.write('{}');
    req3.end();
  } else {
    nextGroup (team_index, teams, mfa_disabled, callback)
  }
}

function nextGroup (team_index, teams, mfa_disabled, callback) {
  var delay = 0

  if (team_index++ < teams.length - 1) {
    setTimeout(function(){
      traverseGroups (team_index, teams, mfa_disabled, callback)
    }, delay)
  } else {
    callback ()
  }
}

function userOnNonMfaList (mfa_disabled, user) {
  for (index in mfa_disabled) {
    if (mfa_disabled[index].login == user) {
      return true
    }
  }
  return false
}

function addUserToNotifyList (user) {
  if (userNotOnNotifyList (user)) {
    notifyList.push (user)
  }
}

function userNotOnNotifyList (user) {
  for (notifyList_index in notifyList) {
    if (notifyList[notifyList_index] == user) {
      return false
    }
  }
  return true
}

function showNotifyList (callback) {
  var buffered_out = ""

  if (notifyList.length > 0) {
    buffered_out += "Admin users with MFA disabled:"
    for (notifyList_index in notifyList) {
      buffered_out += "\n\t" + notifyList[notifyList_index]
    }
  } else {
    buffered_out = "All admin users have mfa enabled"
  }

  console.log (buffered_out)

  callback (buffered_out)
}
