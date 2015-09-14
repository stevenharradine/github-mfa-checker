var CONFIG  = require("./config"),
    curl    = require('node-curl'),
    options = {
      HTTPHEADER: [
                   'User-Agent: github-mfa-checker',
                   'Authorization: token ' + CONFIG.GITHUB_TOKEN
                  ]
    },
    notifyList = []

getUsersWithMfaDisabled (function (mfa_disabled_users) {
  getAdminTeamsInOrganization (function (teams) {
    for (team_index in teams) {
      var team = teams[team_index]

      getMembersInTeam (mfa_disabled_users, team, function (members) {
        for (member_index in members) {
          var member = members[member_index],
              login  = member.login

          if (isUserOnNonMfaList (mfa_disabled_users, login)) {
            addUserToNotifyList (login)
          }

          console.log ("m" + member_index + " " + (members.length - 1))
          console.log ("t" + team_index + " " + (teams.length - 1))
          console.log ("+" + (member_index == members.length - 1 && team_index == teams.length - 1))

          if (member_index == members.length - 1 && team_index == teams.length - 1) {
            showNotifyList ()
          }
        }
      })
    }
  })
})

function getUsersWithMfaDisabled (callback) {
  curl("https://api.github.com/orgs/" + CONFIG.GITHUB_ORG + "/members?filter=2fa_disabled", options, function(err) {
    var mfa_disabled_users = JSON.parse(this.body)

    console.log ("Non-MFA enabled users in org:")
    for (i in mfa_disabled_users) {
      console.log ("\t" + mfa_disabled_users[i].login)
    }

    callback (mfa_disabled_users)
  })
}

function getAdminTeamsInOrganization (callback) {
  curl("https://api.github.com/orgs/" + CONFIG.GITHUB_ORG + "/teams", options, function(err) {
    var teams = JSON.parse(this.body),
        admin_teams = new Array ()

    console.log ("Admin teams in organization:")
    for (i in teams) {
      if (teams[i].permission == "admin") {
        console.log ("\t" + teams[i].name)

        admin_teams.push (teams[i])
      }
    }

    callback (admin_teams)
  })
}

function getMembersInTeam (mfa_disabled_users, team, callback) {
  var this_curl = curl.create()

  this_curl(team.members_url.replace ("{/member}", ""), options, function(err) {
    var members = JSON.parse(this.body)

    console.log (team.name)
    for (i in members) {
      console.log ("\t" + (isUserOnNonMfaList (mfa_disabled_users, members[i].login) ? "*" : "")+ members[i].login)
    }

    callback (members)
  })
}

function isUserOnNonMfaList (mfa_disabled, user) {
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

function showNotifyList () {
  console.log ("Admin users with MFA disabled:")
  for (notifyList_index in notifyList) {
    console.log ("\t" + notifyList[notifyList_index])
  }
}