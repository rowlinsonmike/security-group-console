---
title: Get Started
description: A guide to getting up and running
---

This guide will get Security Group Console up and running in your environment


### Local Development

clone the repo
```
git clone https://github.com/rowlinsonmike/security-group-console.git
```

edit the .env file in the root
```
ACCOUNT="123456789123" # aws account id where your instance is deployed
ADMIN_PASSWORD="mysuperstrongpassword" # admin account for the website
SALT="CHANGEMETOSOMETHINGSTRONG" # string to salt sensitive information
ASSUME_ROLE="my_assume_role" # aws assume role that your instance should assume for other accounts
```

install api packages
```
#from root
cd api
pyhton3 -m venv env
source env/bin/activate
pip3 install -r requirements.txt
```

install client packages
```
# from root
cd client
npm i
```

start rethinkdb and nginx
```
# from root of repo
docker-compose -f docker-compose.local.yml up -d
```

> Prerequisites
> - make sure you have AWS creds in your environment before starting up the fastapi server

start next app and fastapi server
```
cd client
npm run dev
```

### Deployment
> Prerequisites
> - stand up an EC2 ubuntu instance in your AWS account
> - attach an instance profile that allows creating/modifying/deleting security groups and attaching them to EC2 instances. Also ensure that if you are using this in a multi account environment that it can assume the role defined in the .env file. This is how SGC authenticates to other accounts.

from the instance 

clone the repo
```
git clone https://github.com/rowlinsonmike/security-group-console.git
```

edit the .env file in the root
```
ACCOUNT="123456789123" # aws account id where your instance is deployed
ADMIN_PASSWORD="mysuperstrongpassword" # admin account for the website
SALT="CHANGEMETOSOMETHINGSTRONG" # string to salt sensitive information
ASSUME_ROLE="my_assume_role" # aws assume role that your instance should assume for other accounts
```

from the root of the repo
```
docker-compose up -d
```
