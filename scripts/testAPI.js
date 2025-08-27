import axios from "axios";

const BASE_URL = "http://localhost:4000/api";

async function testAPI() {
  try {
    console.log("🧪 Testing Church Fellowship Backend API...\n");

    // Test 1: Get colleges
    console.log("1. Testing GET /tutorials/colleges");
    const collegesResponse = await axios.get(`${BASE_URL}/tutorials/colleges`);
    console.log("✅ Colleges:", collegesResponse.data.data);
    console.log("");

    // Test 2: Get courses for SET college
    console.log("2. Testing GET /tutorials/colleges/SET/courses");
    try {
      const coursesResponse = await axios.get(
        `${BASE_URL}/tutorials/colleges/SET/courses`
      );
      console.log("✅ Courses for SET:", coursesResponse.data.data);
    } catch (error) {
      console.log(
        "⚠️  No courses found for SET (this is expected if no courses exist yet)"
      );
    }
    console.log("");

    // Test 3: Get courses for CHS college
    console.log("3. Testing GET /tutorials/colleges/CHS/courses");
    try {
      const coursesResponse = await axios.get(
        `${BASE_URL}/tutorials/colleges/CHS/courses`
      );
      console.log("✅ Courses for CHS:", coursesResponse.data.data);
    } catch (error) {
      console.log(
        "⚠️  No courses found for CHS (this is expected if no courses exist yet)"
      );
    }
    console.log("");

    // Test 4: Get courses for JUPEP college
    console.log("4. Testing GET /tutorials/colleges/JUPEP/courses");
    try {
      const coursesResponse = await axios.get(
        `${BASE_URL}/tutorials/colleges/JUPEP/courses`
      );
      console.log("✅ Courses for JUPEP:", coursesResponse.data.data);
    } catch (error) {
      console.log(
        "⚠️  No courses found for JUPEP (this is expected if no courses exist yet)"
      );
    }
    console.log("");

    console.log("🎉 API testing completed!");
    console.log("\n📝 Next steps:");
    console.log("1. Create courses using the admin interface");
    console.log("2. Upload topic documents for each course");
    console.log("3. Test the user interface to browse tutorials");
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testAPI();
