import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI as string;

// Inline schemas to avoid module resolution issues in script
const InternSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    nic: String,
    phone: String,
    position: String,
    department: String,
    startDate: Date,
    endDate: Date,
    university: String,
    mentor: String,
    status: String,
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    mobile: String,
    isActive: { type: Boolean, default: true },
    internRef: { type: mongoose.Schema.Types.ObjectId, ref: "Intern" },
    department: String,
    position: String,
    preferences: {
      theme: { type: String, default: "system" },
      language: { type: String, default: "en" },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      compactMode: { type: Boolean, default: false },
      timezone: { type: String, default: "Asia/Colombo" },
    },
    loginAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

async function migrate() {
  console.log("🚀 Starting TRIMIDS User Migration...\n");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const InternModel =
    mongoose.models.Intern || mongoose.model("Intern", InternSchema);
  const UserModel =
    mongoose.models.User || mongoose.model("User", UserSchema);

  // Fetch all interns
  const interns = await InternModel.find({}).select("+password").lean();
  console.log(`📋 Found ${interns.length} interns in database\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const intern of interns) {
    try {
      const existing = await UserModel.findOne({ email: intern.email });
      if (existing) {
        console.log(`⏭️  Skipping ${intern.email} - already migrated`);
        skipped++;
        continue;
      }

      await UserModel.create({
        name: intern.fullName,
        email: intern.email,
        password: intern.password, // Already hashed
        role: "intern",
        mobile: intern.phone,
        department: intern.department,
        position: intern.position,
        isActive: intern.status === "active",
        internRef: intern._id,
        preferences: {
          theme: "system",
          language: "en",
          emailNotifications: true,
          pushNotifications: true,
          compactMode: false,
          timezone: "Asia/Colombo",
        },
      });

      console.log(`✅ Migrated intern: ${intern.email} → role: intern`);
      created++;
    } catch (error: any) {
      console.error(`❌ Error migrating ${intern.email}:`, error.message);
      errors++;
    }
  }

  // Create default admin if none exists
  const adminExists = await UserModel.findOne({ role: "admin" });
  if (!adminExists) {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    await UserModel.create({
      name: "System Administrator",
      email: "admin@trimids.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      preferences: {
        theme: "system",
        language: "en",
        emailNotifications: true,
        pushNotifications: true,
        compactMode: false,
        timezone: "Asia/Colombo",
      },
    });

    console.log("\n🔐 Created default admin account:");
    console.log("   Email:    admin@trimids.com");
    console.log("   Password: Admin@123");
    console.log("   ⚠️  Please change the password after first login!\n");
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   ✅ Created:  ${created}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   ❌ Errors:   ${errors}`);
  console.log("\n🎉 Migration completed!\n");

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((error) => {
  console.error("💥 Migration failed:", error);
  process.exit(1);
});