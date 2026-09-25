const express = require('express');
const mongoose = require('mongoose');
const app = express();

const port = 4555;

app.use(express.json());


const databaseConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/techSchoolApp");
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
  }
};

databaseConnection();

app.get("/", (req, res) => {
  res.send("Hello World");
});

const studentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  age:         Number,
  email:       { type: String, required: true, unique: true },
  phone:       String,
  address:     String,
  course:      { type: String, minlength: 2 },
  institution: String
});

const Student = mongoose.model("Student", studentSchema);


app.post("/create-student", async (req, res) => {
  const { name, age, email, phone, address, course, institution } = req.body;

    if (!name || !email) {
    return res.status(400).json({
      message: "name and email are required"
    });
  }

  try {
    const student = new Student({
      name, age, email, phone, address, course, institution
    });
    await student.save();
    return res.status(200).json({
      message: "Student created successfully",
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/search-students", async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({
      message: "Query parameter q is required and cannot be empty"
    });
  }

  try {
    const term = q.trim();

    const students = await Student.find({
      $or: [
        { name:   { $regex: term, $options: "i" } },
        { email:  { $regex: term, $options: "i" } },
        { course: { $regex: term, $options: "i" } }
      ]
    });

    return res.status(200).json({
      message: "Search completed",
      students
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/get-students", async (req, res) => {
  try {
    const students = await Student.find();
    return res.status(200).json({
      message: "Students fetched successfully",
      students
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/get-student-by-name", async (req, res) => {
  const { name } = req.query;
  try {
    const student = await Student.find({ name });
    return res.status(200).json({
      message: "Student fetched successfully",
      student
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/get-student/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid student ID format"
    });
  }

  try {
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Student fetched successfully",
      student
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/update-student/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age, email, phone, address, course, institution } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      id,
      { name, age, email, phone, address, course, institution },
      { new: true, runValidators: true } // new = return updated doc; validators ON
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Student updated successfully",
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/students/:id/course", async (req, res) => {
  const { id } = req.params;
  const { course } = req.body;

  if (!course || course.trim() === "") {
    return res.status(400).json({
      message: "course is required and cannot be empty"
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }


  try {
    const student = await Student.findByIdAndUpdate(
      id,
      { course: course.trim() },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      student
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


app.delete("/delete-student/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found — nothing to delete"
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
