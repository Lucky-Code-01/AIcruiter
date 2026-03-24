import * as z from "zod";

const passwordValidation = z
.string()
.min(6,"Password must be atleast 6 character or greater than")
.max(25,"Password is no more than 25 character")


const singinSchema = z.object({
    email: z.email({error:"Invalid email format"}),
    password: passwordValidation
});

export default singinSchema