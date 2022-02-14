import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";

import { log } from "../../../utils";

export const userRoles = ["user", "admin"];

export interface UserDocument {
  email: string;
  password: string;
  role?: string;
}

export interface UserModel extends mongoose.Model<UserDocument, {}> {
  register(body: UserDocument): void;
  login(body: UserDocument): Promise<UserDocument | null>;
  isLoggedIn(): Promise<UserDocument | null>;
}

const schema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required !"],
      minlength: [10, "Email length must be between 10 and 100 characters!"],
      maxlength: [100, "Email length must be between 10 and 100 characters!"],
    },
    password: {
      type: String,
      required: [true, "Password is required !"],
      minlength: [10, "Password length must be between 10 and 100 characters!"],
      maxlength: [
        100,
        "Password length must be between 10 and 100 characters!",
      ],
    },
    role: {
      type: String,
      default: userRoles[0],
      enum: userRoles,
    },
  },
  {
    collection: "user",
    timestamps: true,
  }
);

// index
schema.index({ email: "text" }, { name: "email_text", background: true });

// virtuals

// statics
schema.static("register", async function (body: UserDocument): Promise<void> {
  let { password, email, role } = body;
  if (await this.findOne({ email })) throw "This email already exists!";
  password = await bcryptjs.hash(password, 10);
  await new User({ email, password, role }).save();
});

schema.static(
  "login",
  async function (body: UserDocument): Promise<UserDocument | null> {
    const { email, password } = body;
    const result = await User.findOne({ email })
      .select("email password id role")
      .exec();

    if (result && (await bcryptjs.compare(password, result.password))) {
      return result;
    }

    throw "Wrong credentials!";
  }
);

schema.static("isLoggedIn", function (id): Promise<UserDocument | null> {
  return this.findById(id).select("email").exec();
});

// hooks
schema.pre("save", async function (): Promise<void> {
  log.info(`pre:save:${this.modelName}`);
});

schema.post(
  "save",
  async function (error: any, res: any, next: any): Promise<void> {
    log.info(`post:save:${this.modelName}`);
  }
);

export const User = mongoose.model<UserDocument, UserModel>("User", schema);
