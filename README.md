# Online Checkers

This is a classic Checkers game where two players can play against each other online in real-time. The frontend is built using React, while the backend uses AWS services such as API Gateway (WebSockets), Lambda, and DynamoDB.

## Getting Started

### Installation
1. Clone the repository.
2. Navigate to the project directory:
```
cd checkers-app
```
3. Install the dependencies:
```
npm install
```

### Running the App
1. Start the development server:
```
npm start
```
2. Open your browser and navigate to `http://localhost:3000` to see the app running.

## Project Structure
- `src/Components`: Contains the React components, such as the board and modals.
- `src/utils`: Contains utility functions.
- `src/GameLogic`: Contains the core game logic, such as the initial board and move validation.
- `src/LambdaFunctions`: Contains the lambda functions that are running in the backend.