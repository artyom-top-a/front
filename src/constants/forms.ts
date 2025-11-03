export type AuthFormProps = {
    id: string
    type: "email" | "text" | "password"
    inputType: "select" | "input"
    options?: { value: string; label: string; id: string }[]
    label?: string
    placeholder: string
    name: string
}


export const SIGN_UP_FORM: AuthFormProps[] = [
    {
        id: "1",
        inputType: "input",
        placeholder: "Name",
        name: "name",
        type: "text",
    },
    {
        id: "2",
        inputType: "input",
        placeholder: "Email",
        name: "email",
        type: "email",
    },
    {
        id: "3",
        inputType: "input",
        placeholder: "Password",
        name: "password",
        type: "password",
    },
]

export const SIGN_IN_FORM: AuthFormProps[] = [
    {
        id: "1",
        inputType: "input",
        placeholder: "Email",
        name: "email",
        type: "email",
    },
    {
        id: "3",
        inputType: "input",
        placeholder: "Password",
        name: "password",
        type: "password",
    },
]


export const PASSWORD_RESET_FORM: AuthFormProps[] = [
    {
        id: "1",
        inputType: "input",
        placeholder: "Email",
        name: "email",
        type: "email",
    },
]

export const NEW_PASSWORD_FORM: AuthFormProps[] = [
    {
        id: "2",
        inputType: "input",
        placeholder: "New Password",
        name: "newPassword",
        type: "password",
    },
    {
        id: "3",
        inputType: "input",
        placeholder: "Confirm New Password",
        name: "confirmNewPassword",
        type: "password",
    },
]