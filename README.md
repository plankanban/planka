# Planka

A Trello-like application built with React and Redux.

![](https://raw.githubusercontent.com/meltyshev/planka/master/demo.gif)

[**Client demo**](https://meltyshev.github.io/planka) (with some limitations).

## Features

- Create projects, boards, lists, cards, labels and tasks
- Add card members, track time, set a deadline, write comments
- Filter by members and labels
- Real-time updates
- User notifications
- Internationalization

## Deploy

### Docker Compose

[![](https://d207aa93qlcgug.cloudfront.net/1.95.5.qa/img/nav/docker-logo-loggedout.png)](https://hub.docker.com/r/meltyshev/planka)

- Make sure you have [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed and operational.
- Create `docker-compose.yml` based on [the example](./docker-compose.yml). This is the ONLY file you will need. You can create this file on your own machine by copy and pasting the content.
- Edit `BASE_URL` to match your domain name or IP address.

Download the docker-compose.yml:

```
curl -L https://raw.githubusercontent.com/meltyshev/planka/master/docker-compose.yml -o docker-compose.yml
```

Pull images and start services:

```
docker-compose up -d
```

Demo user: demo@demo.demo demo

## Development

```
git clone https://github.com/meltyshev/planka.git
```

Server folder:

```
npm install

# Create a database and edit DATABASE_URL in .env file

npm run db:migrate
npm run db:seed

npm run start:dev
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

In progress..

## License

Planka is [MIT licensed](./LICENSE).
