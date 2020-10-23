### Link to API Documentaion(postman)
https://documenter.getpostman.com/view/10360687/TVYF6xR6

So this is the complete api for a bootcamp website.
What is included in this API?
###For Bootcamps
-It Lists all bootcamps in the database with
   * Pagination
   * Select specific fields in result
   * Limit number of results
   * Filter by fields
- can Search bootcamps by radius from zipcode
-  Get single bootcamp by ID
-  Create new bootcamp but
- Upload a photo for bootcamp
- Update bootcamps
- Delete Bootcamp
- Calculate the average cost of all courses for a bootcamp
- Calculate the average rating from the reviews for a bootcamp

### Courses
- List all courses for bootcamp
- List all courses in general With Pagination, filtering, etc
- Get single course
- Create new course
- Update course
- Delete course
  
### Reviews
- List all reviews for a bootcamp
- List all reviews in general with Pagination, filtering, etc
- Get a single review
- Create a review
- Update review
- Delete review
### Users & Authentication
- Authentication with JWT and cookie
- User registration with Passwords hashing
- User login
- User logout
- Get user with Route to get the currently logged in user
- Password reset (lost password)
  *  request to reset password
  * A hashed token will be emailed to the users registered email address
  * A put request can be made to the generated url to reset password
- Update user info
- User CRUD
- Users can only be made admin by updating the database field manually

## Security
- Encrypt passwords and reset tokens
- Prevent cross site scripting - XSS
- Prevent NoSQL injections
- Add a rate limit for requests of 100 requests per 10 minutes
- Protect against http param polution
- Add headers for security (helmet)
- Use cors to make API public (for now)
