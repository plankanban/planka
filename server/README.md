# Planka server

This repository contains a Sails.js application that can be run without using `sails lift`. 
Instead, you can start the server using `node app.js` or other process managers.

## Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Sails.js](https://sailsjs.com/) (if needed, install globally using `npm install -g sails`)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Application
You can start the server using:
```sh
node app.js
```
Alternatively, you can use process managers like:
- `npm start`
- `forever start app.js`
- `pm2 start app.js`
- `node debug app.js`

### Configuration
You can pass command-line arguments and environment variables to customize the server behavior. Example:
```sh
NODE_ENV=production node app.js --port=80 --verbose
```
For more configuration options, refer to the [Sails.js documentation](https://sailsjs.com/documentation).

## Deployment
When deploying to a platform like Heroku, ensure that:
- All dependencies are installed using `npm install --production`.
- The correct environment variables are set.
- The process is managed correctly (e.g., using `forever` or `pm2`).

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Contact
For any issues or contributions, feel free to open an issue or reach out to [your contact information].

