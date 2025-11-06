// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/access/Ownable.sol";

contract FoodTraceability is Ownable {
    // Use simple uint256 instead of deprecated Counters
    uint256 private _nextProductId = 1;
    
    // Food product lifecycle stages
    enum State { 
        Harvested,      // 0 - Harvested from farm
        Processed,      // 1 - Processed/packaged  
        Shipped,        // 2 - Shipped to distributor
        Distributed,    // 3 - At distributor warehouse
        Retail,         // 4 - At retail store
        Sold           // 5 - Sold to consumer
    }
    
    // Stakeholder roles
    enum Role {
        Admin,          // System admin
        Farmer,         // Grows/harvests food
        Processor,      // Processes food
        Distributor,    // Distributes food
        Retailer,       // Sells food
        Consumer        // Buys food
    }
    
    // Food product structure
    struct FoodProduct {
        uint256 id;
        string name;                    // Product name (e.g., "Organic Apples")
        string category;                // Food category (e.g., "Fruit")
        string origin;                  // Farm/origin location
        uint256 harvestDate;            // When harvested
        uint256 expiryDate;             // Expiry date
        address farmer;                 // Farmer who grew it
        address processor;              // Who processed it
        address distributor;            // Who distributed it
        address retailer;               // Who sells it
        address consumer;               // Who bought it
        State currentState;             // Current stage
        string batchNumber;             // Batch identifier
        string[] certifications;        // Organic, Fair Trade, etc.
        bool isOrganic;                // Organic certification
        uint256 price;                  // Price in wei
    }
    
    // User/Stakeholder structure  
    struct Stakeholder {
        address addr;
        Role role;
        string name;
        string location;
        bool isActive;
        uint256 registrationDate;
    }
    
    // Transaction history
    struct Transaction {
        uint256 productId;
        address from;
        address to;
        State newState;
        uint256 timestamp;
        string notes;
        string location;
    }
    
    // Storage mappings
    mapping(uint256 => FoodProduct) public products;
    mapping(address => Stakeholder) public stakeholders;
    mapping(uint256 => Transaction[]) public productHistory;
    mapping(address => uint256[]) public userProducts;
    
    // Events for tracking
    event ProductCreated(uint256 indexed productId, address indexed farmer, string name);
    event StateChanged(uint256 indexed productId, State newState, address indexed changedBy);
    event StakeholderRegistered(address indexed stakeholder, Role role, string name);
    event OwnershipTransferred(uint256 indexed productId, address indexed from, address indexed to);
    event QualityAlert(uint256 indexed productId, string alertType, string description);
    
    // Access control modifiers
    modifier onlyStakeholder() {
        require(stakeholders[msg.sender].isActive, "Not a registered stakeholder");
        _;
    }
    
    modifier onlyProductOwner(uint256 _productId) {
        FoodProduct memory product = products[_productId];
        require(
            msg.sender == product.farmer || 
            msg.sender == product.processor || 
            msg.sender == product.distributor || 
            msg.sender == product.retailer || 
            msg.sender == owner(),
            "Not authorized to modify this product"
        );
        _;
    }
    
    modifier onlyRole(Role _role) {
        require(stakeholders[msg.sender].role == _role, "Unauthorized role");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Register contract deployer as admin
        stakeholders[msg.sender] = Stakeholder({
            addr: msg.sender,
            role: Role.Admin,
            name: "System Administrator",
            location: "System",
            isActive: true,
            registrationDate: block.timestamp
        });
    }
    
    // Register stakeholders (farmers, processors, etc.)
    function registerStakeholder(
        address _addr,
        Role _role,
        string memory _name,
        string memory _location
    ) public onlyOwner {
        stakeholders[_addr] = Stakeholder({
            addr: _addr,
            role: _role,
            name: _name,
            location: _location,
            isActive: true,
            registrationDate: block.timestamp
        });
        
        emit StakeholderRegistered(_addr, _role, _name);
    }
    
    // Create food product (farmers only)
    function createFoodProduct(
        string memory _name,
        string memory _category,
        string memory _origin,
        uint256 _expiryDate,
        string memory _batchNumber,
        string[] memory _certifications,
        bool _isOrganic,
        uint256 _price
    ) public onlyStakeholder onlyRole(Role.Farmer) returns (uint256) {
        
        uint256 newProductId = _nextProductId;
        _nextProductId++;
        
        products[newProductId] = FoodProduct({
            id: newProductId,
            name: _name,
            category: _category,
            origin: _origin,
            harvestDate: block.timestamp,
            expiryDate: _expiryDate,
            farmer: msg.sender,
            processor: address(0),
            distributor: address(0),
            retailer: address(0),
            consumer: address(0),
            currentState: State.Harvested,
            batchNumber: _batchNumber,
            certifications: _certifications,
            isOrganic: _isOrganic,
            price: _price
        });
        
        userProducts[msg.sender].push(newProductId);
        
        // Record creation transaction
        productHistory[newProductId].push(Transaction({
            productId: newProductId,
            from: address(0),
            to: msg.sender,
            newState: State.Harvested,
            timestamp: block.timestamp,
            notes: "Product harvested and registered",
            location: _origin
        }));
        
        emit ProductCreated(newProductId, msg.sender, _name);
        return newProductId;
    }
    
    // Update product state
    function updateProductState(
        uint256 _productId,
        State _newState,
        string memory _notes,
        string memory _location
    ) public onlyProductOwner(_productId) {
        FoodProduct storage product = products[_productId];
        product.currentState = _newState;
        
        productHistory[_productId].push(Transaction({
            productId: _productId,
            from: msg.sender,
            to: msg.sender,
            newState: _newState,
            timestamp: block.timestamp,
            notes: _notes,
            location: _location
        }));
        
        emit StateChanged(_productId, _newState, msg.sender);
    }
    
    // Transfer product ownership
    function transferProduct(
        uint256 _productId,
        address _to,
        State _newState,
        string memory _notes
    ) public onlyProductOwner(_productId) {
        FoodProduct storage product = products[_productId];
        address from = msg.sender;
        
        Stakeholder memory newOwner = stakeholders[_to];
        require(newOwner.isActive, "Recipient not registered");
        
        // Update ownership based on recipient role
        if (newOwner.role == Role.Processor) {
            product.processor = _to;
        } else if (newOwner.role == Role.Distributor) {
            product.distributor = _to;
        } else if (newOwner.role == Role.Retailer) {
            product.retailer = _to;
        } else if (newOwner.role == Role.Consumer) {
            product.consumer = _to;
        }
        
        product.currentState = _newState;
        userProducts[_to].push(_productId);
        
        productHistory[_productId].push(Transaction({
            productId: _productId,
            from: from,
            to: _to,
            newState: _newState,
            timestamp: block.timestamp,
            notes: _notes,
            location: newOwner.location
        }));
        
        emit OwnershipTransferred(_productId, from, _to);
        emit StateChanged(_productId, _newState, msg.sender);
    }
    
    // Quality alert system
    function reportQualityIssue(
        uint256 _productId,
        string memory _alertType,
        string memory _description
    ) public onlyStakeholder {
        require(_productId < _nextProductId && _productId > 0, "Product does not exist");
        
        emit QualityAlert(_productId, _alertType, _description);
    }
    
    // View functions
    function getProduct(uint256 _productId) public view returns (FoodProduct memory) {
        require(_productId < _nextProductId && _productId > 0, "Product does not exist");
        return products[_productId];
    }
    
    function getProductHistory(uint256 _productId) public view returns (Transaction[] memory) {
        return productHistory[_productId];
    }
    
    function getUserProducts(address _user) public view returns (uint256[] memory) {
        return userProducts[_user];
    }
    
    function getTotalProducts() public view returns (uint256) {
        return _nextProductId - 1;
    }
    
    function getStakeholder(address _addr) public view returns (Stakeholder memory) {
        return stakeholders[_addr];
    }
    
    function isExpired(uint256 _productId) public view returns (bool) {
        require(_productId < _nextProductId && _productId > 0, "Product does not exist");
        return block.timestamp > products[_productId].expiryDate;
    }
    
    function getProductsByState(State _state) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_nextProductId - 1);
        uint256 counter = 0;
        
        for (uint256 i = 1; i < _nextProductId; i++) {
            if (products[i].currentState == _state) {
                result[counter] = i;
                counter++;
            }
        }
        
        // Resize array to actual size
        uint256[] memory trimmedResult = new uint256[](counter);
        for (uint256 j = 0; j < counter; j++) {
            trimmedResult[j] = result[j];
        }
        
        return trimmedResult;
    }
}
