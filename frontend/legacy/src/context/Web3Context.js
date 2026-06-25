import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Extended mock data for products with more realistic supply chain data
const initialProducts = [
  {
    id: "1",
    name: "Organic Apples",
    category: "Fruit",
    origin: "Green Valley Farm, CA",
    harvestDate: "2023-10-15",
    expiryDate: "2023-11-15",
    farmer: "Green Valley Farm",
    processor: "Fresh Food Processing Co",
    distributor: "National Distribution Ltd",
    retailer: "City Supermarket Chain",
    consumer: "John Doe Consumer",
    currentState: 5, // Sold
    batchNumber: "BATCH-2023-001",
    isOrganic: true,
    price: "0.01",
    certifications: ["USDA Organic", "Non-GMO"],
    qualityScore: 95
  },
  {
    id: "2",
    name: "Fresh Carrots",
    category: "Vegetable",
    origin: "Organic Farms, TX",
    harvestDate: "2023-10-10",
    expiryDate: "2023-12-10",
    farmer: "Organic Farms",
    processor: "Fresh Food Processing Co",
    distributor: "National Distribution Ltd",
    retailer: "City Supermarket Chain",
    consumer: "",
    currentState: 4, // Retail
    batchNumber: "BATCH-2023-002",
    isOrganic: true,
    price: "0.02",
    certifications: ["USDA Organic"],
    qualityScore: 88
  },
  {
    id: "3",
    name: "Whole Wheat Bread",
    category: "Bakery",
    origin: "Artisan Bakery, NY",
    harvestDate: "2023-10-20",
    expiryDate: "2023-10-27",
    farmer: "Organic Farms",
    processor: "Artisan Bakery",
    distributor: "National Distribution Ltd",
    retailer: "City Supermarket Chain",
    consumer: "",
    currentState: 4, // Retail
    batchNumber: "BATCH-2023-003",
    isOrganic: false,
    price: "0.03",
    certifications: ["Kosher"],
    qualityScore: 92
  },
  {
    id: "4",
    name: "Free Range Eggs",
    category: "Dairy",
    origin: "Happy Hens Farm, FL",
    harvestDate: "2023-10-18",
    expiryDate: "2023-11-18",
    farmer: "Happy Hens Farm",
    processor: "Fresh Food Processing Co",
    distributor: "National Distribution Ltd",
    retailer: "",
    consumer: "",
    currentState: 3, // Distributed
    batchNumber: "BATCH-2023-004",
    isOrganic: true,
    price: "0.04",
    certifications: ["Free Range", "USDA Organic"],
    qualityScore: 90
  },
  {
    id: "5",
    name: "Grass Fed Beef",
    category: "Meat",
    origin: "Green Pastures Ranch, CO",
    harvestDate: "2023-10-05",
    expiryDate: "2023-11-05",
    farmer: "Green Pastures Ranch",
    processor: "",
    distributor: "",
    retailer: "",
    consumer: "",
    currentState: 0, // Harvested
    batchNumber: "BATCH-2023-005",
    isOrganic: true,
    price: "0.05",
    certifications: ["Grass Fed", "USDA Organic"],
    qualityScore: 94
  }
];

// Extended mock data for stakeholders
const initialStakeholders = [
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    role: 1, // Farmer
    name: "Green Valley Farm",
    location: "California, USA",
    isActive: true,
    registrationDate: "2023-01-01",
    products: ["1", "5"],
    rating: 4.8
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    role: 2, // Processor
    name: "Fresh Food Processing Co",
    location: "New York, USA",
    isActive: true,
    registrationDate: "2023-01-02",
    products: ["1", "2", "4"],
    rating: 4.6
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    role: 3, // Distributor
    name: "National Distribution Ltd",
    location: "Texas, USA",
    isActive: true,
    registrationDate: "2023-01-03",
    products: ["1", "2", "3", "4"],
    rating: 4.7
  },
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    role: 4, // Retailer
    name: "City Supermarket Chain",
    location: "Florida, USA",
    isActive: true,
    registrationDate: "2023-01-04",
    products: ["1", "2", "3"],
    rating: 4.5
  },
  {
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    role: 5, // Consumer
    name: "John Doe Consumer",
    location: "Washington, USA",
    isActive: true,
    registrationDate: "2023-01-05",
    products: ["1"],
    rating: 4.9
  },
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    role: 1, // Farmer
    name: "Happy Hens Farm",
    location: "Florida, USA",
    isActive: true,
    registrationDate: "2023-01-06",
    products: ["4"],
    rating: 4.7
  },
  {
    address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    role: 2, // Processor
    name: "Artisan Bakery",
    location: "New York, USA",
    isActive: true,
    registrationDate: "2023-01-07",
    products: ["3"],
    rating: 4.8
  },
  {
    address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    role: 1, // Farmer
    name: "Green Pastures Ranch",
    location: "Colorado, USA",
    isActive: true,
    registrationDate: "2023-01-08",
    products: ["5"],
    rating: 4.6
  }
];

// Mock sales data for analytics
const initialSalesData = [
  { month: 'Jan', sales: 4000, products: 240 },
  { month: 'Feb', sales: 3000, products: 139 },
  { month: 'Mar', sales: 2000, products: 180 },
  { month: 'Apr', sales: 2780, products: 190 },
  { month: 'May', sales: 1890, products: 200 },
  { month: 'Jun', sales: 2390, products: 210 },
  { month: 'Jul', sales: 3490, products: 220 },
  { month: 'Aug', sales: 2000, products: 180 },
  { month: 'Sep', sales: 2500, products: 190 },
  { month: 'Oct', sales: 3000, products: 210 },
  { month: 'Nov', sales: 4000, products: 230 },
  { month: 'Dec', sales: 3500, products: 200 }
];

// Mock quality data for analytics
const initialQualityData = [
  { category: 'Fruit', score: 92 },
  { category: 'Vegetable', score: 88 },
  { category: 'Bakery', score: 90 },
  { category: 'Dairy', score: 85 },
  { category: 'Meat', score: 89 }
];

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(0);
  const [stakeholderInfo, setStakeholderInfo] = useState(null);
  const [products, setProducts] = useState(initialProducts);
  const [stakeholders, setStakeholders] = useState(initialStakeholders);
  const [salesData, setSalesData] = useState(initialSalesData);
  const [qualityData, setQualityData] = useState(initialQualityData);

  // Available demo accounts
  const demoAccounts = [
    {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      name: 'Green Valley Farm',
      role: 1,
      description: 'Organic Farm - Farmer',
      type: 'farmer'
    },
    {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      name: 'Fresh Food Processing Co',
      role: 2,
      description: 'Food Processing Company',
      type: 'processor'
    },
    {
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      name: 'National Distribution Ltd',
      role: 3,
      description: 'Supply Chain Distributor',
      type: 'distributor'
    },
    {
      address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      name: 'City Supermarket Chain',
      role: 4,
      description: 'Retail Partner',
      type: 'retailer'
    },
    {
      address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
      name: 'John Doe Consumer',
      role: 5,
      description: 'End Consumer',
      type: 'consumer'
    },
    {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      name: 'System Admin',
      role: 0,
      description: 'System Administrator',
      type: 'admin'
    }
  ];

  // Smart account detection based on address
  const getAccountInfo = (address) => {
    const addressLower = address.toLowerCase();
    
    // Predefined account mapping for presentation
    const knownAccounts = {
      // Account #1 - Farmer
      '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': {
        name: 'Green Valley Farm',
        role: 1,
        isActive: true,
        description: 'Organic Farm - Farmer',
        type: 'farmer'
      },
      // Account #2 - Processor  
      '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': {
        name: 'Fresh Food Processing Co',
        role: 2,
        isActive: true,
        description: 'Food Processing Company',
        type: 'processor'
      },
      // Account #3 - Distributor
      '0x90f79bf6eb2c4f870365e785982e1f101e93b906': {
        name: 'National Distribution Ltd',
        role: 3,
        isActive: true,
        description: 'Supply Chain Distributor',
        type: 'distributor'
      },
      // Account #4 - Retailer
      '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65': {
        name: 'City Supermarket Chain',
        role: 4,
        isActive: true,
        description: 'Retail Partner',
        type: 'retailer'
      },
      // Account #5 - Consumer
      '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc': {
        name: 'John Doe Consumer',
        role: 5,
        isActive: true,
        description: 'End Consumer',
        type: 'consumer'
      }
    };

    // Check if account is known
    if (knownAccounts[addressLower]) {
      return knownAccounts[addressLower];
    }

    // For unknown accounts, provide admin access for demo
    return {
      name: 'Demo User',
      role: 0,
      isActive: true,
      description: 'Default User',
      type: 'default'
    };
  };

  // Function to connect to a specific account
  const connectToAccount = async (accountAddress) => {
    try {
      setIsLoading(true);
      setError(null);

      // Find the selected account
      const selectedAccount = demoAccounts.find(acc => acc.address === accountAddress);
      
      if (!selectedAccount) {
        throw new Error('Invalid account selected');
      }
      
      setAccount(accountAddress);
      setIsConnected(true);

      // Set user role and info
      setUserRole(selectedAccount.role);
      setStakeholderInfo({
        name: selectedAccount.name,
        role: selectedAccount.role,
        description: selectedAccount.description,
        type: selectedAccount.type
      });
      
      console.log('✅ Connected as:', selectedAccount.name, `(${selectedAccount.description})`);

    } catch (error) {
      console.error('Failed to connect to account:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to connect wallet (MetaMask)
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        // Fallback to demo accounts if MetaMask is not installed
        const randomAccount = demoAccounts[Math.floor(Math.random() * demoAccounts.length)];
        setAccount(randomAccount.address);
        setIsConnected(true);
        setUserRole(randomAccount.role);
        setStakeholderInfo({
          name: randomAccount.name,
          role: randomAccount.role,
          description: randomAccount.description,
          type: randomAccount.type
        });
        return;
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      console.log('Connected account:', account);

      // Set connection states
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setIsConnected(true);

      // Smart role detection based on account address
      const accountInfo = getAccountInfo(account);
      setUserRole(accountInfo.role);
      setStakeholderInfo(accountInfo);
      
      console.log('✅ Connected as:', accountInfo.name, `(${accountInfo.description})`);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setUserRole(null);
    setStakeholderInfo(null);
    setError(null);
  };

  // Function to get all products
  const getAllProducts = () => {
    return products;
  };

  // Function to get a product by ID
  const getProduct = (id) => {
    return products.find(product => product.id === id);
  };

  // Function to get total number of products
  const getTotalProducts = () => {
    return products.length;
  };

  // Function to create a new product (only works when connected)
  const createProduct = async (productData) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet to create products');
    }
    
    if (userRole !== 1) { // Only farmers can create products
      throw new Error('Only farmers can create products');
    }

    // Simulate blockchain transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          id: (products.length + 1).toString(),
          ...productData,
          farmer: stakeholderInfo.name,
          currentState: 0, // Harvested
          consumer: ""
        };
        
        setProducts(prev => [...prev, newProduct]);
        resolve(newProduct);
      }, 500);
    });
  };

  // Function to get all stakeholders
  const getAllStakeholders = () => {
    return stakeholders;
  };

  // Function to register a new stakeholder (only works when connected)
  const registerStakeholder = async (stakeholderData) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet to register stakeholders');
    }
    
    if (userRole !== 0) { // Only admins can register stakeholders
      throw new Error('Only admins can register stakeholders');
    }

    // Simulate blockchain transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStakeholder = {
          ...stakeholderData,
          registrationDate: new Date().toISOString().split('T')[0],
          products: [],
          rating: 0
        };
        
        setStakeholders(prev => [...prev, newStakeholder]);
        resolve(newStakeholder);
      }, 500);
    });
  };

  // Function to add a product directly to JSON (no MetaMask required)
  const addProductToJSON = (productData) => {
    const newProduct = {
      id: (products.length + 1).toString(),
      ...productData
    };
    
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  // Function to add a stakeholder directly to JSON (no MetaMask required)
  const addStakeholderToJSON = (stakeholderData) => {
    const newStakeholder = {
      ...stakeholderData,
      registrationDate: new Date().toISOString().split('T')[0],
      products: [],
      rating: 0
    };
    
    setStakeholders(prev => [...prev, newStakeholder]);
    return newStakeholder;
  };

  // Function to get product history (mock data)
  const getProductHistory = (productId) => {
    // Mock history data for demonstration
    return [
      {
        productId: productId,
        from: "0x0000000000000000000000000000000000000000",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        newState: 0,
        timestamp: new Date("2023-10-15T08:00:00Z"),
        notes: "Product harvested",
        location: "Green Valley Farm, CA"
      },
      {
        productId: productId,
        from: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        newState: 1,
        timestamp: new Date("2023-10-16T10:30:00Z"),
        notes: "Product processed",
        location: "Fresh Food Processing Co, NY"
      },
      {
        productId: productId,
        from: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        to: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        newState: 2,
        timestamp: new Date("2023-10-17T14:15:00Z"),
        notes: "Product shipped to distributor",
        location: "National Distribution Ltd, TX"
      },
      {
        productId: productId,
        from: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        to: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        newState: 3,
        timestamp: new Date("2023-10-18T09:45:00Z"),
        notes: "Product distributed to retailer",
        location: "City Supermarket Chain, FL"
      },
      {
        productId: productId,
        from: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        to: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        newState: 4,
        timestamp: new Date("2023-10-19T16:20:00Z"),
        notes: "Product purchased by consumer",
        location: "John Doe Consumer, WA"
      }
    ];
  };

  // Function to get sales data for analytics
  const getSalesData = () => {
    return salesData;
  };

  // Function to get quality data for analytics
  const getQualityData = () => {
    return qualityData;
  };

  // Function to get products by stakeholder
  const getProductsByStakeholder = (stakeholderAddress) => {
    const stakeholder = stakeholders.find(s => s.address === stakeholderAddress);
    if (!stakeholder) return [];
    
    return products.filter(p => stakeholder.products.includes(p.id));
  };

  // Function to update product state (for selling/purchasing)
  const updateProductState = async (productId, newState, toAddress, notes) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet to perform transactions');
    }

    // Simulate blockchain transaction
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          setProducts(prevProducts => 
            prevProducts.map(product => {
              if (product.id === productId) {
                // Update the product state and assign to new stakeholder
                const updatedProduct = { ...product };
                
                // Update the appropriate field based on the new state
                switch(newState) {
                  case 1: // Processed
                    updatedProduct.processor = stakeholderInfo.name;
                    break;
                  case 2: // Shipped
                    updatedProduct.distributor = stakeholderInfo.name;
                    break;
                  case 3: // Distributed
                    updatedProduct.retailer = stakeholderInfo.name;
                    break;
                  case 4: // Retail
                    updatedProduct.retailer = stakeholderInfo.name;
                    break;
                  case 5: // Sold
                    updatedProduct.consumer = stakeholderInfo.name;
                    break;
                  default:
                    break;
                }
                
                updatedProduct.currentState = newState;
                return updatedProduct;
              }
              return product;
            })
          );
          
          // Also update the stakeholder's product list
          setStakeholders(prevStakeholders => 
            prevStakeholders.map(stakeholder => {
              if (stakeholder.address === toAddress) {
                if (!stakeholder.products.includes(productId)) {
                  return {
                    ...stakeholder,
                    products: [...stakeholder.products, productId]
                  };
                }
              }
              return stakeholder;
            })
          );
          
          resolve({ success: true, message: 'Product state updated successfully' });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };

  // Function to get stakeholders by role
  const getStakeholdersByRole = (role) => {
    return stakeholders.filter(s => s.role === role);
  };

  // Function to simulate full supply chain transaction (admin only)
  const simulateFullSupplyChain = async (productId) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet to perform transactions');
    }
    
    if (userRole !== 0) { // Only admins can simulate full supply chain
      throw new Error('Only admins can simulate full supply chain transactions');
    }

    // Simulate the entire supply chain process step by step
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          setProducts(prevProducts => 
            prevProducts.map(product => {
              if (product.id === productId) {
                // Simulate the full supply chain progression
                return {
                  ...product,
                  processor: "Fresh Food Processing Co",
                  distributor: "National Distribution Ltd",
                  retailer: "City Supermarket Chain",
                  consumer: "John Doe Consumer",
                  currentState: 5 // Sold
                };
              }
              return product;
            })
          );
          
          // Update stakeholders with the product
          setStakeholders(prevStakeholders => 
            prevStakeholders.map(stakeholder => {
              // Add product to each stakeholder in the chain if not already there
              if (!stakeholder.products.includes(productId)) {
                let shouldAdd = false;
                
                // Check if this stakeholder should have this product based on role
                switch(stakeholder.role) {
                  case 2: // Processor
                    shouldAdd = true;
                    break;
                  case 3: // Distributor
                    shouldAdd = true;
                    break;
                  case 4: // Retailer
                    shouldAdd = true;
                    break;
                  case 5: // Consumer
                    shouldAdd = true;
                    break;
                  default:
                    shouldAdd = false;
                }
                
                if (shouldAdd) {
                  return {
                    ...stakeholder,
                    products: [...stakeholder.products, productId]
                  };
                }
              }
              return stakeholder;
            })
          );
          
          resolve({ success: true, message: 'Full supply chain simulation completed successfully' });
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  // Function to reset product to initial state (harvested)
  const resetProductToHarvested = async (productId) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet to perform transactions');
    }
    
    if (userRole !== 0) { // Only admins can reset products
      throw new Error('Only admins can reset products');
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          setProducts(prevProducts => 
            prevProducts.map(product => {
              if (product.id === productId) {
                // Reset to initial harvested state
                return {
                  ...product,
                  processor: "",
                  distributor: "",
                  retailer: "",
                  consumer: "",
                  currentState: 0 // Harvested
                };
              }
              return product;
            })
          );
          
          resolve({ success: true, message: 'Product reset to harvested state successfully' });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    error,
    userRole,
    stakeholderInfo,
    demoAccounts, // Expose demo accounts for account selection
    connectToAccount, // New function to connect to specific account
    connectWallet,
    disconnectWallet,
    getAllProducts,
    getProduct,
    getTotalProducts,
    createProduct,
    getAllStakeholders,
    registerStakeholder,
    addProductToJSON, // New function to add products without MetaMask
    addStakeholderToJSON, // New function to add stakeholders without MetaMask
    getProductHistory, // New function to get product history
    getSalesData, // New function for analytics
    getQualityData, // New function for quality analytics
    getProductsByStakeholder, // New function to get products by stakeholder
    updateProductState, // New function for selling/purchasing
    getStakeholdersByRole, // New function to get stakeholders by role
    simulateFullSupplyChain, // New function for admin-driven supply chain simulation
    resetProductToHarvested  // New function to reset product state
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};