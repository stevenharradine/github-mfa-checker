# github-mfa-checker
Checks all admin users of a github org have their 2 factor authentication enabled.

[![Licence](https://img.shields.io/badge/Licence-ISC-blue.svg)](https://opensource.org/licenses/ISC) [![Code Climate](https://codeclimate.com/github/stevenharradine/github-mfa-checker/badges/gpa.svg)](https://codeclimate.com/github/stevenharradine/github-mfa-checker) [![Issue Count](https://codeclimate.com/github/stevenharradine/github-mfa-checker/badges/issue_count.svg)](https://codeclimate.com/github/stevenharradine/github-mfa-checker)

## install npm packages
```
npm install
```

## set up your org and github token in the config
```
module.exports.GITHUB_TOKEN = "{{ your_token }}"
module.exports.GITHUB_ORG = "{{ your_org }}"
```

## run the app
```
node github-mfa-checker
```
