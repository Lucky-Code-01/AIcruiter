import  CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt from 'bcrypt'
import dbConnection from "@/utils/Connection";
import UserModel from "@/models/userModel";
import { NextAuthOptions } from "next-auth";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "text", placeholder: "Enter your password" }
            },

            async authorize(credentials: any): Promise<any>{
                await dbConnection();
                try{
                    const email = credentials.email;
                    const password = credentials.password;

                    const user = await UserModel.findOne({ email: email});

                    if(!user){
                        throw new Error("No user found with this email!!");
                    }
                    const passwordCorrect = await bcrypt.compare(password, user.password);

                    if (passwordCorrect) {
                        return user; 
                    }
                    else {
                        throw new Error("Password incorrect try again!!");
                    }

                }
                catch(error){
                    console.log(error);
                    throw new Error("Something went wrong to login");
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString()
                token.username = user.username
                token.email = user.email
            }
            return token;
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.username = token.username
                session.user.email = token.email
            }
            return session
        }
    },

    pages: {
        signIn: '/sign-in',
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },

    secret: process.env.NEXTAUTH_SECRET
}