"use server"

// app/actions/userActions.ts
import { client } from '@/lib/prisma'; // Ensure you have a prisma instance exported in lib/prisma.ts
import { revalidatePath } from 'next/cache'; // Useful if you want to revalidate any page after mutation

// Update User Information
export async function updateUser(userId: string, name: string, email: string) {
  try {
    const updatedUser = await client.user.update({
      where: { id: userId },
      data: { name, email },
    });

    // Revalidate the path if needed, for example the settings page
    revalidatePath(`/settings`);
    
    return updatedUser;
  } catch {
    throw new Error('Failed to update user');
  }
}

export async function deleteUser(userId: string) {
  try {
    console.log(`Attempting to delete user with ID: ${userId}`);

    // Check if the user exists
    const user = await client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User with ID: ${userId} not found.`);
      throw new Error(`User not found`);
    }

    // Proceed to delete the user, which will cascade to related records
    const result = await client.user.delete({
      where: { id: userId },
    });

    console.log(`User deleted successfully with ID: ${userId}`, result);

    // Optionally, invalidate or revalidate a path
    revalidatePath(`/sign-up`); // Revalidate the homepage if they are redirected there
    
    return { success: true };
  } catch (error: unknown) { // Use `unknown` instead of `any`
    if (error instanceof Error) {
      console.error('Prisma error in deleteUser:', error.message); // Safely access `message`
      throw new Error(`Failed to delete user: ${error.message}`);
    } else {
      console.error('Unknown error in deleteUser:', error); // Handle unknown errors
      throw new Error(`Failed to delete user due to an unknown error.`);
    }
  }
}