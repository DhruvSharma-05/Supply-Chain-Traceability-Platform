# Blockchain Supply Chain Traceability Platform

A comprehensive blockchain-based supply chain traceability platform for food products, enabling transparent tracking from farm to consumer.

## ⚠️ Project Status

**This project is under an active refactor from a UI prototype into a real dApp.**

Current reality (read before relying on anything below):
- The `FoodTraceability` smart contract is complete and deployable, but **has no tests yet**.
- The React frontend currently runs on **mock, in-memory data** — it does **not** call the smart contract. Wallet "connection" and all "transactions" are simulated.
- Several sections further down describe the *intended* end state, not what runs today.

The plan to close that gap is tracked in [`ISSUES.md`](ISSUES.md) (Phases 0–7). Contributor and AI-agent working guidelines live in [`CLAUDE.md`](CLAUDE.md).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Frontend Components](#frontend-components)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Blockchain Supply Chain Traceability Platform is a decentralized application (dApp) that leverages blockchain technology to provide transparent and immutable tracking of food products throughout the supply chain. This system ensures food safety, authenticity, and quality by recording every step of a product's journey on the blockchain.

## Features

### Core Features
- **Product Creation**: Farmers can register new food products with detailed information
- **Supply Chain Tracking**: End-to-end tracking from harvest to consumer purchase
- **Stakeholder Management**: Registration and management of all supply chain participants
- **Quality Assurance**: Recording of quality inspections and certifications
- **Real-time Tracking**: Live status updates of products in the supply chain
- **QR Code Generation**: Quick access to product information via QR codes

### Advanced Features
- **Analytics Dashboard**: Comprehensive data visualization and reporting
- **Marketplace**: Peer-to-peer trading between supply chain stakeholders
- **Supply Chain Simulation**: Admin-driven full supply chain process simulation
- **Export Functionality**: PDF and CSV report generation
- **Role-based Access Control**: Different permissions for various stakeholder types

### Security Features
- **Immutable Records**: Blockchain-based tamper-proof data storage
- **Authentication**: MetaMask wallet integration for secure access
- **Access Control**: Role-based permissions for different user types
- **Data Privacy**: Selective disclosure of information based on user roles

## Technology Stack

### Backend
- **Blockchain**: Ethereum (Hardhat local network for development)
- **Smart Contracts**: Solidity ^0.8.0
- **Development Framework**: Hardhat
- **Testing**: Mocha & Chai

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Context API
- **Blockchain Interaction**: ethers.js v6
- **Charting**: Recharts
- **QR Code Generation**: QRServer API

### Development Tools
- **Package Manager**: npm
- **Code Editor**: Visual Studio Code
- **Version Control**: Git
- **Testing**: Jest, React Testing Library

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/MUI)                     │
├─────────────────────────────────────────────────────────────┤
│                   Web3 Context Provider                     │
├─────────────────────────────────────────────────────────────┤
│                    ethers.js Library                        │
├─────────────────────────────────────────────────────────────┤
│                  Ethereum Blockchain                        │
├─────────────────────────────────────────────────────────────┤
│                 Smart Contracts (Solidity)                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
1. **Smart Contracts Layer**: Core business logic and data storage
2. **Blockchain Layer**: Ethereum network for transaction processing
3. **Backend Layer**: ethers.js for blockchain interaction
4. **Frontend Layer**: React application with Material-UI components
5. **Data Layer**: JSON storage for demonstration purposes

## Installation

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MetaMask browser extension
- Git

### Smart Contract Setup
```bash
# From the repository root (Hardhat runs from root, not contracts/)

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Start local blockchain network
npx hardhat node

# Deploy contracts (in new terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Usage

### Running the Application
1. Start the local Ethereum network:
   ```bash
   npx hardhat node
   ```

2. Deploy the smart contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Start the frontend application:
   ```bash
   cd frontend
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

### User Roles and Permissions
- **Admin (Role 0)**: System administrator with full access
- **Farmer (Role 1)**: Can create products and view their products
- **Processor (Role 2)**: Can process products and update their status
- **Distributor (Role 3)**: Can ship and distribute products
- **Retailer (Role 4)**: Can receive and sell products
- **Consumer (Role 5)**: Can purchase products and view product history

### Key Workflows

#### Product Creation (Farmer)
1. Connect MetaMask wallet as a farmer
2. Navigate to "Create Product" page
3. Fill in product details (name, category, origin, etc.)
4. Submit to create product on blockchain

#### Supply Chain Tracking
1. Navigate to "Product Tracking" page
2. Enter product ID to search
3. View complete supply chain history
4. Generate QR code for sharing

#### Admin Supply Chain Simulation
1. Connect as admin user
2. Navigate to "Supply Chain Simulator"
3. Select a harvested product
4. Click "Simulate Full Supply Chain" to progress through all stages

## Project Structure

```
blockchain-supply-chain/
├── contracts/
│   └── FoodTraceability.sol
├── scripts/
│   └── deploy.js
├── test/                      # (empty — contract tests added in Phase 1)
├── hardhat.config.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/        # NetworkChecker
│   │   │   └── Layout/        # Layout
│   │   ├── context/
│   │   │   └── Web3Context.js # mock data layer (no contract calls yet)
│   │   ├── pages/             # Dashboard, Products, Tracking, Admin, etc.
│   │   ├── theme/
│   │   └── App.js
│   └── package.json
├── research/                  # research paper + MVP documentation
├── CLAUDE.md                  # contributor / agent guidelines
├── ISSUES.md                  # refactor roadmap (Phases 0–7)
├── README.md
└── package.json
```

## Smart Contracts

### FoodTraceability.sol

Main smart contract implementing the supply chain functionality:

#### Key Data Structures
- `Product`: Represents a food product with all its attributes
- `Stakeholder`: Represents a supply chain participant
- `ProductHistory`: Records each step in a product's journey

#### Main Functions
- `registerStakeholder()`: Register new supply chain participants
- `createFoodProduct()`: Create new food products
- `updateProductState()`: Update product status as it moves through supply chain
- `transferProduct()`: Transfer product ownership between stakeholders
- `getProduct()`: Retrieve product information
- `getProductHistory()`: Get complete product journey history

#### Events
- `ProductCreated`: Emitted when a new product is created
- `ProductStateUpdated`: Emitted when product status changes
- `ProductTransferred`: Emitted when product ownership changes
- `StakeholderRegistered`: Emitted when a new stakeholder is registered

## Frontend Components

### Pages
1. **DashboardPage**: Main overview with key metrics
2. **StakeholdersPage**: Stakeholder management and registration
3. **ProductsPage**: List and search all products
4. **CreateProductPage**: Form for farmers to create new products
5. **ProductTrackingPage**: Detailed product tracking and history
6. **SupplyChainVisualization**: Visual representation of supply chain
7. **AnalyticsDashboard**: Data visualization and reporting
8. **Marketplace**: Peer-to-peer trading platform
9. **AdminPage**: Administrative functions and data management
10. **AdminSupplyChainSimulator**: Full supply chain process simulation

### Context
- **Web3Context**: Centralized blockchain state management

### Components
- **Layout**: Main application layout with navigation

## API Endpoints

### Smart Contract Functions
All interactions with the blockchain are done through the smart contract functions:

#### Product Management
- `createFoodProduct(string name, string category, string origin, uint256 harvestDate, uint256 expiryDate, string batchNumber, string[] memory certifications, bool isOrganic, uint256 price) returns (uint256)`
- `getProduct(uint256 productId) view returns (Product memory)`
- `getTotalProducts() view returns (uint256)`
- `getUserProducts(address user) view returns (uint256[] memory)`

#### Supply Chain Operations
- `updateProductState(uint256 productId, uint8 newState, string memory notes) external`
- `transferProduct(uint256 productId, address newOwner, uint8 newState, string memory notes) external`

#### Stakeholder Management
- `registerStakeholder(address stakeholderAddress, uint8 role, string name, string location) external`
- `getStakeholder(address stakeholderAddress) view returns (Stakeholder memory)`

#### History Tracking
- `getProductHistory(uint256 productId) view returns (ProductHistory[] memory)`

## Testing

### Smart Contract Testing
```bash
# Run contract tests (from repository root)
npx hardhat test
```

### Frontend Testing
```bash
# Run frontend tests
cd frontend
npm test
```

### Test Coverage
> **Status:** Not yet implemented. There are currently no automated tests.
> A full Hardhat test suite for the contract is planned in Phase 1 (see [`ISSUES.md`](ISSUES.md)),
> with frontend and end-to-end tests in later phases.

## Deployment

### Local Development
1. Start Hardhat local network:
   ```bash
   npx hardhat node
   ```

2. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Update contract address in frontend Web3Context

4. Start frontend:
   ```bash
   cd frontend
   npm start
   ```

### Production Deployment
1. Deploy to Ethereum testnet (Goerli, Sepolia) or mainnet
2. Update contract addresses in frontend
3. Build frontend for production:
   ```bash
   cd frontend
   npm run build
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

### Development Guidelines
- Follow Solidity style guide for smart contracts
- Use React best practices for frontend components
- Write comprehensive tests for new features
- Update documentation when making changes


## Acknowledgments

- Ethereum blockchain platform
- Hardhat development environment
- React and Material-UI libraries
- All contributors to the open-source community

---

*This documentation provides a comprehensive overview of the Blockchain Supply Chain Traceability Platform. For specific implementation details, please refer to the source code and inline comments.*