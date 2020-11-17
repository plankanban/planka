# Planka

![David (path)](https://img.shields.io/david/plankanban/planka?path=client) ![Docker Pulls](https://img.shields.io/docker/pulls/meltyshev/planka) ![GitHub](https://img.shields.io/github/license/plankanban/planka)

A Trello-like kanban board built with React and Redux.

![](https://raw.githubusercontent.com/plankanban/planka/master/demo.gif)

[**Client demo**](https://plankanban.github.io/planka) (without server features).

<a href="https://ko-fi.com/meltyshev" target="_blank"><img src="https://cdn.ko-fi.com/cdn/kofi4.png?v=2" alt="Buy Me a Coffee at ko-fi.com" border="0" height="36" style="border:0px;height:36px;" /></a>

## Features

- Create projects, boards, lists, cards, labels and tasks
- Add card members, track time, set a due date, add attachments, write comments
- Markdown support in a card description and comment
- Filter by members and labels
- Customize project background
- Real-time updates
- User notifications
- Internationalization

## Roadmap

### Current task

Projects should have Managers who have the ability to create/edit/delete boards. Boards should have their own Members, so members won't see all boards, just those they belong to. Planka will be released after this breaking change.

### Future tasks

- Fetch last data after reconnection
- Custom fields
- Public boards
- Automatic actions

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

## License

Planka is [MIT licensed](https://github.com/plankanban/planka/blob/master/LICENSE).
