## Auth API

Base path: `/api`

### JWT

- **token**: JWT signed with payload `{ id, role }`, expires in 7 days
- Send as header: `Authorization: Bearer <token>`

### Endpoints

#### POST `/api/auth/register`

- **Body (JSON)**

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Secret123!",
  "age": 21,
  "level": "200",
  "gender": "male",
  "dob": "2003-01-15",
  "faculty": "Science",
  "college": "Engineering",
  "department": "Computer Science",
  "isChurchMember": true,
  "subjectOfInterest": "Math",
  "bestSubject": "Physics",
  "phone": "+2348012345678"
}
```

- **Required**: `name`, `username`, `email`, `password`
- **Validation**
  - `level`: one of `"100"|"200"|"300"|"400"|"500"|"600"|"700"`
  - `gender`: one of `"male"|"female"|"other"`
  - `dob`: ISO date string (e.g. `YYYY-MM-DD`)
- **Responses**
  - 201
  ```json
  {
    "token": "<JWT>",
    "user": {
      "id": "<id>",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    }
  }
  ```
  - 400: missing/invalid fields
  - 409: email or username already taken

#### POST `/api/auth/login`

- **Body (JSON)**

```json
{ "email": "john@example.com", "password": "Secret123!" }
```

- **Responses**
  - 200
  ```json
  {
    "token": "<JWT>",
    "user": {
      "id": "<id>",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    }
  }
  ```
  - 400: missing email/password
  - 401: invalid credentials

#### GET `/api/auth/me`

- **Headers**: `Authorization: Bearer <token>`
- **Response**: 200

```json
{
  "user": {
    "_id": "<id>",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "member",
    "age": 21,
    "level": "200",
    "gender": "male",
    "dob": "2003-01-15T00:00:00.000Z",
    "faculty": "Science",
    "college": "Engineering",
    "department": "Computer Science",
    "isChurchMember": true,
    "subjectOfInterest": "Math",
    "bestSubject": "Physics",
    "phone": "+2348012345678",
    "profileImage": { "url": "", "publicId": "" },
    "createdAt": "<ISO>",
    "updatedAt": "<ISO>"
  }
}
```

- 401: missing/invalid token

### User Model

```json
{
  "name": "String (required)",
  "username": "String (required, unique, lowercase)",
  "email": "String (required, unique, lowercase)",
  "password": "String (required, write-only)",
  "role": "enum('member','exec','admin') = 'member'",
  "age": "Number (0..150)",
  "level": "enum('100','200','300','400','500','600','700') = '100'",
  "gender": "enum('male','female','other') = 'other'",
  "dob": "Date",
  "faculty": "String",
  "college": "String",
  "department": "String",
  "isChurchMember": "Boolean = false",
  "subjectOfInterest": "String",
  "bestSubject": "String",
  "phone": "String",
  "profileImage": { "url": "String", "publicId": "String" },
  "timestamps": true
}
```

### Notes

- Password is hashed on save. `username` is stored lowercase.
- Use the returned JWT for subsequent authenticated requests.
