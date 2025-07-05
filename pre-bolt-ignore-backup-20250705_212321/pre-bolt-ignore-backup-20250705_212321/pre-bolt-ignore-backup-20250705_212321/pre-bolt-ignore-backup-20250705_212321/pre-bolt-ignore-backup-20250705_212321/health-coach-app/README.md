# Health Coach AI Chat Application

This project is a health coach AI chat application that provides personalized recommendations to users through a chat interface. Users can interact with the AI coach, receive recommendations, and add items to their cart for easy access.

## Features

- **Chat Interface**: Users can chat with the AI coach and receive personalized health recommendations.
- **Dynamic Recommendations**: Each recommendation comes with an "(Add to Stack)" button that allows users to add items to their cart instantly.
- **Cart Management**: Users can view and manage their cart, which updates dynamically as recommendations are added.

## Project Structure

```
health-coach-app
├── src
│   ├── components
│   │   ├── Chat
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── RecommendationButton.tsx
│   │   ├── Cart
│   │   │   ├── Cart.tsx
│   │   │   └── CartItem.tsx
│   │   └── Layout
│   │       └── Layout.tsx
│   ├── store
│   │   └── cartStore.ts
│   ├── types
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd health-coach-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```
This will launch the application in your default web browser.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.