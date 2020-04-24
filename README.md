# Planka

![David (path)](https://img.shields.io/david/plankanban/planka?path=client) ![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/meltyshev/planka) ![GitHub](https://img.shields.io/github/license/plankanban/planka)

A Trello-like kanban board built with React and Redux.

![](https://raw.githubusercontent.com/plankanban/planka/master/demo.gif)

[**Client demo**](https://plankanban.github.io/planka) (without server features).

## Features

- Create projects, boards, lists, cards, labels and tasks
- Add card members, track time, set a due date, write comments
- Markdown support in a card description and comment
- Filter by members and labels
- Real-time updates
- User notifications
- Internationalization

## Deploy

**Please note that Planka is NOT released yet, API and database structure may be changed!**

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

## Development

```
git clone https://github.com/plankanban/planka.git
```

Root folder:

```
npm install
```

Server folder:

```
npm install

# Create a database and edit DATABASE_URL in .env file

npm run db:migrate
npm run db:seed

npm run start
```

Client folder:

```
npm install

npm start
```

Demo user: demo@demo.demo demo

## Tech stack

- React, Redux, Redux-Saga, Redux-ORM, Semantic UI React, react-beautiful-dnd
- Sails.js, Knex.js
- PostgreSQL

## Roadmap

- [x] File attachments
- [ ] Member permissions
- [ ] Fetch last data after reconnection
- [ ] Custom fields
- [ ] Public boards
- [ ] Automatic actions

## License

Planka is [MIT licensed](https://github.com/plankanban/planka/blob/master/LICENSE).
