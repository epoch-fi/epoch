/**
 * @summary Form for making search request to AI chatbot
 * @component UserForm
 * @param {Function} onSubmit - Function to handle form submission
 * @param {boolean} isLoading - Flag indicating if the form is currently loading
 * @param {UseFormReturn} form - Form hook return object
 */

import React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { UseFormReturn, useForm } from "react-hook-form";
import { SendHorizontal } from "lucide-react";
import { FormSchema } from "@/lib/formSchema";

interface Props {
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
  isLoading: boolean;
  form: UseFormReturn<z.infer<typeof FormSchema>>;
}

const UserForm = ({ onSubmit, isLoading, form }: Props) => {
  return (
    <div className="absolute bottom-2 left-0 h-20 w-full rounded-lg bg-transparent px-3 sm:px-12">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
          className=" flex w-full items-end justify-between gap-x-4 space-y-6"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormMessage className="ml-2 text-xs" />
                <FormControl>
                  <Input
                    placeholder="How can I assist you today?"
                    className=" rounded-full border-none bg-secondaryBg font-medium text-gray-300 outline-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            disabled={isLoading}
            className="group flex items-center bg-secondaryBg p-2 hover:bg-primaryGray disabled:bg-primaryGray"
            type="submit"
          >
            <SendHorizontal className="transition-all duration-300 ease-in-out group-hover:scale-[1.1]" />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UserForm;
