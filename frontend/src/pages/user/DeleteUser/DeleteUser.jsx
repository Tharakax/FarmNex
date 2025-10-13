import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from "sweetalert2";

function DeleteUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const deleteUser = async () => {
      // Step 1: Ask for confirmation
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      // Step 2: If user clicks cancel, go back
      if (!result.isConfirmed) {
        navigate("/userdetails");
        return;
      }

      try {
        // Step 3: Show loading indicator
        Swal.fire({
          title: "Deleting user...",
          text: "Please wait a moment.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Step 4: Perform delete request
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        await axios.delete(`http://localhost:3000/users/${id}`, { headers });

        // Step 5: Show success alert
        Swal.fire("Deleted!", "User has been deleted successfully.", "success");

        // Step 6: Redirect after a short delay
        setTimeout(() => navigate("/userdetails"), 1500);
      } catch (error) {
        console.error("Failed to delete user:", error);

        // Step 7: Show error alert
        Swal.fire("Error!", "Failed to delete user. Try again later.", "error");

        navigate("/userdetails");
      }
    };

    deleteUser();
  }, [id, navigate]);

  return (
    <div>
      <h2 className="text-center text-gray-700">Deleting user...</h2>
    </div>
  );
}

export default DeleteUser;
