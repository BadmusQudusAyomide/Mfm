# Church Fellowship Backend

A clean, restructured backend for managing church tutorials and educational content.

## New Structure

The system follows this hierarchy:

1. **Tutorials** → Lists hardcoded colleges (SET, CHS, JUPEP)
2. **College** → Lists courses for that college
3. **Course** → Lists topics (dynamically from database)
4. **Topic** → Shows the document (PDF)

## API Endpoints

### Tutorials

- `GET /api/tutorials/colleges` - Get hardcoded colleges
- `GET /api/tutorials/colleges/:collegeAbbr/courses` - Get courses for a college
- `GET /api/tutorials/courses/:courseId/topics` - Get topics for a course
- `GET /api/tutorials/topics/:topicId` - Get a specific topic document
- `POST /api/tutorials/courses/:courseId/topics` - Upload a new topic document
- `PUT /api/tutorials/topics/:topicId` - Update a topic document
- `DELETE /api/tutorials/topics/:topicId` - Delete a topic document
- `PATCH /api/tutorials/topics/:topicId/publish` - Toggle topic publish status
- `GET /api/tutorials/topics/:topicId/view` - View PDF document
- `GET /api/tutorials/topics/:topicId/download` - Download PDF document

### Courses (Admin)

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `PATCH /api/courses/:id/publish` - Toggle course publish status

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

## Models

### College

- Hardcoded colleges: SET, CHS, JUPEP
- Static method `getHardcodedColleges()` returns the predefined list

### Course

- Belongs to a college
- Has code, title, level, description
- Can be published/unpublished

### Tutorial (Topic)

- Belongs to a course
- Has topic name, title, description
- Contains PDF document
- Can be published/unpublished

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Fill in your MongoDB URI and other config
   ```

3. Seed the hardcoded colleges:

   ```bash
   node scripts/seedColleges.js
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Database Schema

The system uses MongoDB with Mongoose. The main collections are:

- `colleges` - Hardcoded college information
- `courses` - Course information linked to colleges
- `tutorials` - Topic documents linked to courses
- `users` - User authentication and management

## Clean Architecture

This backend has been cleaned up to remove:

- Unused models (Subject, Department, Quiz, Event, Group)
- Unnecessary routes and controllers
- Complex legacy code
- Unused features

The focus is now on the core tutorial management system with a clean, hierarchical structure.
