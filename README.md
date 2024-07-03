# e-be-tc
This is a simple book exchange system that allows members to borrow books and return them after a certain period of time.
The system is built using Typescript, Express, and PostgreSQL and adheres to the Domain-Driven Design (DDD) and Command Query Responsibility Segregation (CQRS) patterns.

Other tools used:
- Swagger and Bruno for API docs
- Nix and Direnv for development environment
- Jest for unit testing
- Gitub Actions for CI/CD

## How to run the server
### Normally 
1. Clone the repo
2. Install dependencies with `npm install` or `pnpm install`
3. Create a .env file by copying the .env.example file and fill in the required fields
4. Run the command `npm run dev` to start the server locally
5. Open your browser and navigate to `http://localhost:5000/api-docs` to view the Swagger documentation or if you're using Bruno, you can open the collection provided in the `collections` folder.

### Using Nix
1. Clone the repo
2. Run `direnv allow` to allow direnv to load the .envrc file
3. Run `nix develop` to enter the nix shell or if direnv is enabled, environment will be prepared for you automagically. 
4. Create a .env file by copying the .env.example file and fill in the required fields
5. Run `npm run dev` to start the server locally
6. Open your browser and navigate to `http://localhost:5000/api-docs` to view the Swagger documentation or if you're using Bruno, you can open the collection provided in the `collections` folder.

## How to run the unit tests
1. run `npm run test` to run the tests

## Provided endpoints for each tasks
1. Members can borrow books with conditions
```http
POST /api/books/:bookCode/borrow
```
2. Member returns the book with conditions
```http
POST /api/books/:bookCode/return
```
3. Check list of books with conditions
```http
GET /api/books/in-stock
```
4. Check list of members with conditions
```http
GET /api/members
```

These endpoints and the rest of the endpoints can be accessed through the Swagger documentation here `https://eigen-tc-api.hidayattaufiqur.dev/api-docs`


## TODO: 
- Members can borrow books with conditions
    - [x]  Members may not borrow more than 2 books 
    <!-- can add a field of borrowedBooks in the member table -->
    - [x]  Borrowed books are not borrowed by other members
    <!-- just see if book stock > 0 -->
    - [x]  Member is currently not being penalized
    <!-- can add a field of penalty of type date in the member table -->
- Member returns the book with conditions
    - [x]  The returned book is a book that the member has borrowed
    - [x]  If the book is returned after more than 7 days, the member will be subject to a penalty. Member with penalty cannot able to borrow the book for 3 days
- Check the book
    - [x]  Shows all existing books and quantities
    - [x]  Books that are being borrowed are not counted
- Member check
    - [x]  Shows all existing members
    - [x]  The number of books being borrowed by each member
- Others
    - [x] add more tests
    - [x] add more swagger docs
    - [x] deploy 
    - [x] edit readme
