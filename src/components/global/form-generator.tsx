import React from 'react';
import { Textarea } from "../ui/textarea"
import { ErrorMessage } from "@hookform/error-message"
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"
import { Input } from "../ui/input"
import { Label } from "../ui/label"


type FormGeneratorProps = {
  type?: "text" | "email" | "password" | "number"
  inputType: "select" | "input" | "textarea"
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string

  register: UseFormRegister<any>
  // register: UseFormRegister<FieldValues>
  name: string
  errors: FieldErrors<FieldValues>
  isSubmitted: boolean; // New prop to track if the form has been submitted
  lines?: number
}


// type FormGeneratorProps<T extends FieldValues> = {
//   type?: "text" | "email" | "password" | "number";
//   inputType: "select" | "input" | "textarea";
//   options?: { value: string; label: string; id: string }[];
//   label?: string;
//   placeholder: string;
//   register: UseFormRegister<T>; // Use generic type T instead of FieldValues
//   name: keyof T; // Key must match the form schema fields
//   errors: FieldErrors<T>; // Errors specific to the schema
//   isSubmitted: boolean;
//   lines?: number;
// };


export const FormGenerator = ({
  inputType,
  options,
  label,
  placeholder,
  register,
  name,
  errors,
  isSubmitted, // Destructure the new prop
  type,
  lines,
}: FormGeneratorProps) => {

  // export const FormGenerator = <T extends FieldValues>({
  //   inputType,
  //   options,
  //   label,
  //   placeholder,
  //   register,
  //   name,
  //   errors,
  //   isSubmitted,
  //   type,
  //   lines,
  // }: FormGeneratorProps<T>) => {

  const showError = isSubmitted && errors[name]; // Show error only if form is submitted and there's an error

  switch (inputType) {
    case "input":
      return (
        <Label className="flex flex-col gap-2" htmlFor={`input-${label}`}>
          {label && label}
          <Input
            id={`input-${label}`}
            type={type}
            placeholder={placeholder}
            className="bg-themeBlack border-themeGray text-primary text-md"
            {...register(name)}
          />
          {showError && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <div className="text-red-400 mt-0 text-sm">
                  {message === "Required" ? "" : message}
                </div>
              )}
            />
          )}
        </Label>
      )
    case "select":
      return (
        <Label htmlFor={`select-${label}`} className="flex flex-col gap-2">
          {label && label}
          <select
            id={`select-${label}`}
            className="w-full bg-transparent border-[1px] p-3 rounded-lg text-md"
            {...register(name)}
          >
            {options?.length &&
              options.map((option) => (
                <option
                  value={option.value}
                  key={option.id}
                  className="dark:bg-muted"
                >
                  {option.label}
                </option>
              ))}
          </select>
          {showError && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <div className="text-red-400 mt-0 text-sm">
                  {message === "Required" ? "" : message}
                </div>
              )}
            />
          )}
        </Label>
      )
    case "textarea":
      return (
        <Label className="flex flex-col gap-2" htmlFor={`input-${label}`}>
          {label && label}
          <Textarea
            className="bg-themeBlack border-themeGray text-themeTextGray text-md"
            id={`input-${label}`}
            placeholder={placeholder}
            {...register(name)}
            rows={lines}
          />
          {showError && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <div className="text-red-400 mt-0 text-sm">
                  {message === "Required" ? "" : message}
                </div>
              )}
            />
          )}
        </Label>
      )
    default:
      return <></>
  }
}
