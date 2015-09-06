var CONFIG  = require("./config"),
    curl    = require('node-curl'),
    options = {
      HTTPHEADER: [
                   'User-Agent: github-mfa-checker',
                   'Authorization: token ' + CONFIG.GITHUB_TOKEN
                  ]
    },
    notifyList = []

curl("https://api.github.com/orgs/" + CONFIG.GITHUB_ORG + "/members?filter=2fa_disabled", options, function(err) {
  var mfa_disabled = JSON.parse(this.body)

  console.log ("Non-MFA enabled users in org:")
  for (i in mfa_disabled) {
    console.log ("\t" + mfa_disabled[i].login)
  }

  curl("https://api.github.com/user/teams", options, function(err) {
    var teams = JSON.parse(this.body)

    traverseGroups (0, teams, mfa_disabled)
  })
})


function traverseGroups (team_index, teams, mfa_disabled) {
  if (teams[team_index].permission == "admin") {
    var members_url = teams[team_index].members_url.replace ("{/member}", "")

    console.log (teams[team_index].name + ": " + members_url)
    curl (members_url, options, function(err) {
      if (err) console.log (err)

      var admin_users = JSON.parse(this.body)

      for (i in admin_users) {
        var flagUser = userOnNonMfaList (mfa_disabled, admin_users[i].login)

        console.log ("\t" + (flagUser ? "*" : "") + admin_users[i].login)

        if (flagUser) {
          addUserToNotifyList (admin_users[i].login)
        }
      }

      nextGroup (team_index, teams, mfa_disabled)
    })
  } else {
    nextGroup (team_index, teams, mfa_disabled)
  }
}

function nextGroup (team_index, teams, mfa_disabled) {
  var delay = 0

  if (team_index++ < teams.length - 1) {
    setTimeout(function(){
      traverseGroups (team_index, teams, mfa_disabled)
    }, delay)
  } else {
    showNotifyList ()
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
  console.log ("testing: " + user)
  if (userNotOnNotifyList (user)) {
    console.log ("adding: " + user)
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

function showNotifyList () {
  console.log ("Admin users with MFA disabled:")
  for (notifyList_index in notifyList) {
    console.log ("\t" + notifyList[notifyList_index])
  }
}