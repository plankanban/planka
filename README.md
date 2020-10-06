# Planka

![David (path)](https://img.shields.io/david/plankanban/planka?path=client) ![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/meltyshev/planka) ![GitHub](https://img.shields.io/github/license/plankanban/planka)

A Trello-like kanban board built with React and Redux.

![](https://raw.githubusercontent.com/plankanban/planka/master/demo.gif)

<a href="https://plankanban.github.io/planka" target="_blank">**Client demo**</a> (without server features).

<a href="https://ko-fi.com/meltyshev" target="_blank"><img src="https://cdn.ko-fi.com/cdn/kofi3.png?v=2" alt="Buy Me a Coffee at ko-fi.com" border="0" height="36" style="border:0px;height:36px;" /></a>

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

**Please note that Planka is NOT released yet, API and database structure may be changed!**

### Docker Compose

<a href="https://hub.docker.com/r/meltyshev/planka" target="_blank"><img src="https://d207aa93qlcgug.cloudfront.net/1.95.5.qa/img/nav/docker-logo-loggedout.png" /></a>

- Make sure you have <a href="https://docs.docker.com/get-docker/" target="_blank">Docker</a> and <a href="https://docs.docker.com/compose/install/" target="_blank">Docker Compose</a> installed and operational.
- Create `docker-compose.yml` based on <a href="https://raw.githubusercontent.com/plankanban/planka/master/docker-compose.yml" target="_blank">the example</a>. This is the ONLY file you will need. You can create this file on your own machine by copy and pasting the content.
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

Edit `DATABASE_URL` in `.env` file if needed, then initialize the database:

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

## Roadmap

- [x] File attachments
- [ ] Member permissions
- [ ] Fetch last data after reconnection
- [ ] Custom fields
- [ ] Public boards
- [ ] Automatic actions

## License

Planka is <a href="https://github.com/plankanban/planka/blob/master/LICENSE" target="_blank">MIT licensed</a>.
