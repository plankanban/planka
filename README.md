# Planka

![David (path)](https://img.shields.io/github/package-json/v/plankanban/planka) ![Docker Pulls](https://img.shields.io/docker/pulls/meltyshev/planka) ![GitHub](https://img.shields.io/github/license/plankanban/planka)

A Trello-like kanban board built with React and Redux.

![](https://raw.githubusercontent.com/plankanban/planka/master/demo.gif)

[**Client demo**](https://plankanban.github.io/planka) (without server features).

## Features

- Create projects, boards, lists, cards, labels and tasks
- Add card members, track time, set a due date, add attachments, write comments
- Markdown support in a card description and comment
- Filter by members and labels
- Customize project background
- Real-time updates
- User notifications
- Internationalization

## Deploy

### Docker Compose

[![](https://d207aa93qlcgug.cloudfront.net/1.95.5.qa/img/nav/docker-logo-loggedout.png)](https://hub.docker.com/r/meltyshev/planka)

- Make sure you have [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed and operational.
- Create `docker-compose.yml` based on [the example](https://raw.githubusercontent.com/plankanban/planka/master/docker-compose.yml). This is the ONLY file you will need. You can create this file on your own machine by copy and pasting the content.
- Edit `BASE_URL` to match your domain name or IP address.
- Edit `SECRET_KEY` with random value. You can generate it by `openssl rand -hex 64`.

Download the docker-compose.yml:

```
curl -L https://raw.githubusercontent.com/plankanban/planka/master/docker-compose.yml -o docker-compose.yml
```

Pull images and start services:

```
docker-compose up -d
```

Demo user: demo@demo.demo demo

### Logging

Planka currently allows you to expose the application's logfile directory to the host machine via a shared volume. This feature is not enabled by default.

To expose the logfile director to the host machine, add the item `./logs/:/app/logs/` under `services.planka.volumes`.

Note that the directory to the left of the semicolon is regarding the host machine while the directory to the right of the semicolon is regarding the Docker container.

For example, in the above step, `./logs/:/app/logs/` will create the folder `logs` in the same directory where the `docker-compose.yml` file lives.

### Rotating Logs

Logrotate is designed to ease administration of systems that generate large numbers of log files. It allows automatic rotation, compression, removal, and mailing of log files. Each log file may be handled daily, weekly, monthly, or when it grows too large.

#### Setup logrotate for Planka logs

Create a file in `/etc/logrotate.d` named `planka` with the following contents:

```
/path/to/planka/logs/planka.log {
  daily
  missingok
  rotate 14
  compress
  delaycompress
  notifempty
  create 640 root adm
  sharedscripts
}
```

Ensure to replace logfile directory with your installation’s `/logs/planka.log` location.

Restart the logrotate service.

### Fail2ban

Fail2ban is a service that uses iptables to automatically drop connections for a pre-defined amount of time from IPs that continuously failed to authenticate to the configured services.

#### Setup a filter and a jail for Planka

A filter defines regex rules to identify when users fail to authenticate on Planka's user interface.

Create a file in `/etc/fail2ban/filter.d` named `planka.conf` with the following contents:

```conf
[Definition]
failregex = ^(.*) Invalid (email or username:|password!) (\"(.*)\"!)? ?\(IP: <ADDR>\)$
ignoreregex =
```

The jail file defines how to handle the failed authentication attempts found by the Planka filter.

Create a file in `/etc/fail2ban/jail.d` named `planka.local` with the following contents:

```conf
[planka]
enabled = true
port = http,https
filter = planka
logpath = /path/to/planka/logs/planka.log
maxretry = 5
bantime = 900
```

Ensure to replace `logpath`'s value with your installation’s `/logs/planka.log` location. If you are using ports other than 80 and 443 for your Web server you should replace those too. The bantime and findtime are defined in seconds.

Restart the fail2ban service. You can check the status of your Planka jail by running:

```bash
fail2ban-client status planka
```

## Development

Clone the repository and install dependencies:

```
git clone https://github.com/plankanban/planka.git

cd planka
npm install
```

Either use a local database or start the provided development database:

```
docker-compose -f docker-compose-dev.yml up
```

Create `server/.env` based on `server/.env.sample` and edit `DATABASE_URL` if needed, then initialize the database:

```
npm run server:db:init
```

Start the development server:

```
npm start
```

Demo user: demo@demo.demo demo

## Tech stack

- React, Redux, Redux-Saga, Redux-ORM, Semantic UI React, react-beautiful-dnd
- Sails.js, Knex.js
- PostgreSQL

## License

Planka is [MIT licensed](https://github.com/plankanban/planka/blob/master/LICENSE).
