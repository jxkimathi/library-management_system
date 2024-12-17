# Library Management System API Documentation

## Overview

This documentation provides details about the REST API endpoints for the Library Management System.

## Base URL

```shell
http://127.0.0.1:5000
```

## Authentication

Authentication is required for most endpoints. Use JWT tokens in the Authorization header.

## Endpoints

### Users

### Books

#### Get All Books

- **GET** `/books`
  - Returns list of all books
  - **Response:** 200 OK

#### Get Book by ID

- **GET** `/books/<id>`
  - Returns details of a specific book
  - **Response:** 200 OK

#### Add New Book

- **POST** `/books`
  - Adds a new book (Admin only)
  - **Request Body:**

    ```json
    {
        "title": "string",
        "author": "string",
        "isbn": "string"
    }
    ```

  - **Response:** 201 Created

#### Update Book

- **PUT** `/books/<id>`
  - Updates book information (Admin only)
  - **Response:** 200 OK

#### Delete Book

- **DELETE** `/books/<id>`
  - Removes a book from the system (Admin only)
  - **Response:** 200 OK

  ### Members

  #### Get All Members

  - **GET** `/members`
    - Returns list of all members
    - **Response:** 200 OK

  #### Get Member by ID

  - **GET** `/members/<id>`
    - Returns details of a specific member
    - **Response:** 200 OK

  #### Add New Member

  - **POST** `/members`
    - Registers a new library member
    - **Request Body:**

      ```json
      {
          "name": "string",
          "email": "string",
          "phone": "string"
      }
      ```

    - **Response:** 201 Created

  #### Update Member

  - **PUT** `/members/<id>`
    - Updates member information
    - **Response:** 200 OK

  #### Delete Member

  - **DELETE** `/members/<id>`
    - Removes a member from the system
    - **Response:** 200 OK

  ### Loans and Returns

  #### Issue Book

  - **POST** `/loans`
    - Issues a book to a member
    - **Request Body:**

      ```json
      {
          "book_id": "string",
          "member_id": "string"
      }
      ```

    - **Response:** 201 Created

  #### Return Book

  - **POST** `/returns`
    - Processes a book return
    - **Request Body:**

      ```json
      {
          "loan_id": "string"
      }
      ```

    - **Response:** 200 OK
