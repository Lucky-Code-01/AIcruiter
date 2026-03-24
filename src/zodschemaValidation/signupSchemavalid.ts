import * as z from "zod";

// single validations
export const usernameValidation = z
.string()
.min(2,"User name must be atleast two character or greater than")
.max(25,"User name must be no more than 25 character")
.regex(/^[a-zA-Z0-9_]+$/, "User name must not contain special character");
    

const passwordValidation = z
.string()
.min(6,"Password must be atleast 6 character or greater than")
.max(25,"Password is no more than 25 character")


const singupSchema = z.object({
    username: usernameValidation,
    email: z.email({error:"Invalid email format"}),
    password: passwordValidation
});

export default singupSchema;