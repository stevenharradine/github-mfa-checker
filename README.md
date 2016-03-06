# github-mfa-checker
Checks all admin users of a github org have their 2 factor authentication enabled.

[![Licence](https://img.shields.io/badge/Licence-ISC-blue.svg)](https://opensource.org/licenses/ISC) [![Code Climate](https://codeclimate.com/github/stevenharradine/github-mfa-checker/badges/gpa.svg)](https://codeclimate.com/github/stevenharradine/github-mfa-checker) [![Issue Count](https://codeclimate.com/github/stevenharradine/github-mfa-checker/badges/issue_count.svg)](https://codeclimate.com/github/stevenharradine/github-mfa-checker)

## install npm packages
```
npm install
```

## update config.js
 * `GITHUB_ORG` (string) - github organization to run in
 * `GITHUB_TOKEN` (string) - github token
 * `SLACK_CHANNEL` (string) - Slack channel to notify when admin users found
 * `SLACK_LOG` (string) - Slack channel to log too (more verbose then SLACK_CHANNEL)
 * `SLACK_TOKEN` (string) - Slack token

## run
```
node github-mfa-checker
```
