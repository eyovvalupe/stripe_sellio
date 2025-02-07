Market Place API Documentation

## 1. Authentication APIs

### 1.1 Register User

POST /api/v1/auth/register

Request Body:

```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "userType": "buyer|seller",
  "profileImage": "file"
}
```

Response (200):

```json
{
  "status": "success",
  "token": "jwt_token",
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "userType": "string"
  }
}
```

### 1.2 Login
POST /api/v1/auth/login

Request Body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response (200):

```json
{
  "status": "success",
  "token": "jwt_token"
}
```

## 2. Listing Management APIs

### 2.1 Create Base Listing

Request Body:

```json
{
  "title": "string",
  "description": "string",
  "category": {
    "id": "string",
    "name": "string"
  },
  "subCategory": {
    "id": "string",
    "name": "string"
  },
  "images": ["file"],
  "features": ["string"],
  "requirements": ["string"]
}
```

### 2.2 Add Seller Offer to Listing

Request Body:

```json
{
  "pricing": {
    "basePrice": "number",
    "currency": "string",
    "pricingType": "fixed|hourly|project",
    "negotiable": "boolean"
  },
  "availability": {
    "schedule": [
      {
        "day": "string",
        "startTime": "string",
        "endTime": "string"
      }
    ],
    "instantBooking": "boolean"
  },
  "serviceArea": ["string"],
  "additionalServices": [
    {
      "name": "string",
      "description": "string",
      "price": "number"
    }
  ]
}
```

### 2.3 Get Listing Details

GET /api/listings/listingId

Response:

```json
{
  "listing": {
    "id": "string",
    "title": "string",
    "description": "string",
    "category": {},
    "images": []
  },
  "sellers": [
    {
      "id": "string",
      "name": "string",
      "rating": "number",
      "pricing": {},
      "availability": {},
      "reviews": "number"
    }
  ]
}
```

### 2.4 Search Listings

GET /api/listings/search
Query Parameters:

query: string
category: string
priceMin: number
priceMax: number
location: string
rating: number
instantBooking: boolean
page: number
limit: number

## 3. Order Management APIs

### 3.1 Create Order

Request Body:

```json
{
  "listingId": "string",
  "sellerId": "string",
  "serviceDate": "date",
  "requirements": "string",
  "selectedServices": [
    {
      "serviceId": "string",
      "quantity": "number"
    }
  ]
}
```

### 3.2 Get Order Status

GET /api/orders/:orderId

## 4. Review APIs

### 4.1 Create Review

```json
{
  "orderId": "string",
  "sellerId": "string",
  "rating": "number",
  "comment": "string",
  "images": ["file"]
}
```

## 5. Chat APIs

### 5.1 Send Message

POST /api/messages

```json
{
  "receiverId": "string",
  "listingId": "string",
  "message": "string",
  "attachments": ["file"]
}
```

## 6. Categories APIs

### 6.1 Get All Categories

GET /api/categories

### 6.2 Get Sub-Categories

GET /api/categories/{categoryId}/subcategories

Error Responses
All APIs will return error responses in this format:

```json
{
  "status": "error",
  "code": "number",
  "message": "string",
  "errors": []
}
```

## Common Error Codes:
#### 400: Bad Request
#### 401: Unauthorized
#### 403: Forbidden
#### 404: Not Found
#### 422: Validation Error
#### 500: Server Error

## Authentication
#### All protected routes require Bearer token:
#### Authorization: Bearer {token}
