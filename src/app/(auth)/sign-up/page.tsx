"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios, { AxiosError } from "axios"
import singupSchema from "@/zodschemaValidation/signupSchemavalid"
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { APIResponse } from "@/utils/APIResponse"


function page() {
    const form = useForm({
        resolver: zodResolver(singupSchema),
        defaultValues: {
            username: '',
            password: '',
            email: ''
        }
    });

    //   create some states here
    const [isSubmitting, setisSubmitting] = useState(false);

    // here the function for form submit
    const onSubmit = async (data: z.infer<typeof singupSchema>) => {
        try {
            setisSubmitting(true);
            const response = await axios.post('/api/signup', data);
            toast.success(response.data.message);
        }
        catch (error) {
            console.error('Error during sign-up:', error);
            const axiosError = error as AxiosError<APIResponse>;
            let errorMessage = axiosError.response?.data.message;
            toast.error(errorMessage || "Something went wrong");
        }
        finally {
            setisSubmitting(false);
        }
    };
    

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-8 border bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                        Join AIcruiter 
                    </h1>
                    <p className="mb-4 text-gray-600">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter your username"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input {...field} name="email" placeholder="Enter your email"/>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" {...field} name="password" placeholder="Enter your password"/>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className='w-full' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>

                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default page;
