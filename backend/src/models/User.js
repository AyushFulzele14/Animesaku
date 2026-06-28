const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "customer"], default: "customer", index: true },
    avatar: {
      public_id: String,
      url: String,
    },
    refreshToken: { type: String, select: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.pre("save", async function save() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
