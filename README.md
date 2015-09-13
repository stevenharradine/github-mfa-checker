# github-mfa-checker
Checks all admin users of a github org have their 2 factor authentication enabled.

## install apt dependancies
```
sudo apt-get install libcurl4-openssl-dev
```

## clone the repo
```
git clone https://github.com/stevenharradine/github-mfa-checker.git
cd github-mfa-checker
```

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