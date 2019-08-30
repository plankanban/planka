# Planka

A Trello-like application built with React and Redux.

![](https://github.com/meltyshev/planka/blob/master/demo.gif?raw=true)

Online demo is coming soon.

### Features

- Create projects, boards, lists, cards, labels and tasks
- Add card members, track time, set a deadline, write comments
- Filter by members and labels
- User notifications
- Internationalization

### Tech stack

- React, Redux, Redux-Saga, Redux-ORM, Semantic UI React, react-beautiful-dnd
- Sails.js, Knex.js
- PostgreSQL

### Run in development

```bash
git clone https://github.com/meltyshev/planka.git
```

Server:

```bash
cd server

npm install
```

Create a database and edit DATABASE_URL in .env file.

```bash
npm run db:migrate
npm run db:seed

npm run start:dev
```

Client (second terminal window):

```bash
cd client

npm install

npm start
```

Demo user: demo@demo.demo demo

## Run in production

In progress..

## Todo

In progress..

## License

Planka is [MIT licensed](./LICENSE).
