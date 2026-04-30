export async function deleteUser (id: string) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`https://pily-unbothering-marcy.ngrok-free.dev/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to delete user");
      }

      return {message : "utilisateur supprimé avec succée"};
    } catch (error: any) {
      console.error(error);
      
    }
  }