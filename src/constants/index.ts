import { AuthFormProps, NEW_PASSWORD_FORM, PASSWORD_RESET_FORM, SIGN_IN_FORM, SIGN_UP_FORM } from "./forms"

type ConstantsProps = {
  signUpForm: AuthFormProps[]
  signInForm: AuthFormProps[]
  passwordResetForm: AuthFormProps[]
  newPasswordForm: AuthFormProps[]
}

export const CONSTANTS: ConstantsProps = {
  signUpForm: SIGN_UP_FORM,
  signInForm: SIGN_IN_FORM,
  passwordResetForm: PASSWORD_RESET_FORM,
  newPasswordForm: NEW_PASSWORD_FORM,
}