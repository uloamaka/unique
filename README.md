# unique
An event planning API 

## Installation

Required: [Node](https://nodejs.org/) plus [npm](https://docs.npmjs.com/) and [Git](https://git-scm.com/downloads)

1. Fork the repo

   ```bash
   https://github.com/uloamaka/unique
   ```

2. clone the repo

   ```bash
   git clone https://github.com/<your_github_username>/unique
   ```

3. Change directory

   ```bash
   cd unique/v1
   ```

4. Set the 'upstream' remote repository to track changes from the original repository

    ```bash
    git remote add upstream https://github.com/hngx-org/unique.git
    ```

5. Pull the latest changes from the 'upstream' remote's 'dev' branch into your local branch

   ```bash
   git pull upstream dev
   ```

6. Create a new branch for the issue you want to solve, eg `TicketNumber/(Feat/Bug/Fix/Chore)/Ticket-title` :
   ```bash
   git checkout -b ZP-B01/Feat/swagger docs
   ```


## Running Locally

```bash

npm install

# Copy env.sample to .env and input your keys

npm run dev

```

## Pushing your code

1. Commit your changes with a descriptive commit message, run:
   ```bash
   git commit -m "your commit message"
   ```
2. To make sure there are no conflicts, run:
   ```bash
   git pull origin dev
   ```
3. Push changes to your new branch, e.g `git push origin <your_branch_name>
` run

   ```bash
   git push -u origin ZP-B01/Feat/swagger docs
   ```

4. Create a pull request to the `dev` branch and not `main`.

## Response Utility Functions

### `res.ok(payload, meta)`

This function is used to send a successful response (HTTP status code 200) with a payload and optional metadata. The `payload` parameter represents the data to be sent in the response body, while the `meta` parameter is an optional object containing additional information about the response e.g pagination data.

### `res.created(payload)`

Use this function to send a response indicating that a resource has been successfully created (HTTP status code 201). The `payload` parameter represents the data of the newly created resource.

### `res.noContent()`

This function sends a response with no content (HTTP status code 204). It is typically used for successful requests that do not require a response body.

### Custom Error Classes

Instead of using `res.error` directly, this template encourages the use of custom error classes for handling and responding to errors. These classes simplify error handling by providing consistent error structures and HTTP status codes. The following custom error classes are available:

- `BadRequest`: Represents a 400 Bad Request error. It takes a `message` parameter as the error message and an optional `errorCode` parameter to identify the specific error.
- `Unauthorized`: Represents a 401 Unauthorized error. It takes a `message` parameter as the error message and an optional `errorCode` parameter.
- `Forbidden`: Represents a 403 Forbidden error. It takes a `message` parameter as the error message and an optional `errorCode` parameter.

To throw one of these custom errors, simply create a new instance of the appropriate error class and throw it with the desired error message and error code.

### Finding Error Codes

A list of all error codes can be found in the `httpErrorCode.js` file. This file provides a comprehensive collection of HTTP status codes and their corresponding error codes. You can refer to this file to find the appropriate error code when throwing a custom error.

## NPM Commands

The following npm commands are available for managing and running the Express application:

- `npm run dev`: Starts the development server. This command is used during the development process to run the application with automatic reloading on code changes.

- `npm start`: Starts the production server. This command is used to run the application in a production environment.


Feel free to modify and use these commands according to your specific application needs.

## License

This Express application template is released under the [MIT License](https://opensource.org/licenses/MIT). Feel free to modify and use it for your own projects.
