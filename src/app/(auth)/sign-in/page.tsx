"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import z from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from "next/link";
import singinSchema from "@/zodschemaValidation/signinSchemavalid";
import { useState } from "react";
import { Loader2 } from "lucide-react";


function page() {

  const form = useForm({
    resolver: zodResolver(singinSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const router = useRouter();
  const [isSubmitting, setisSubmitting] = useState(false);

  const onSubmit = async (data: z.infer<typeof singinSchema>) => {
    try {
      setisSubmitting(true);
      const response = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!response) {
        toast.error("Something went wrong");
        return;
      }

      if (response.error) {
        if (response.error === "CredentialsSignin") {
          toast.error("Incorrect email or password");
        } else {
          toast.error(response.error);
        }
        return;
      }

      toast.success("Login successful");
      router.replace("/");

    } catch (error) {
      toast.error("Login failed. Try again.");
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
          <p className="mb-4 text-gray-600">Sign in to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} placeholder="Enter your email" />
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
                  <Input type="password" {...field} placeholder="Enter your password" />
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
                'Sign In'
              )}
            </Button>

          </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Don't have a accound?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default page
