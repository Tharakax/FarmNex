import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function DeleteUser() {
  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  useEffect(() => {
    const deleteUser = async () => {
      const confirmDelete = window.confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) {
        navigate('/userdetails'); // Cancel and go back
        return;
      }

      try {
        await axios.delete(`http://localhost:3000/users/${id}`);
        //alert('User deleted successfully!');
        toast.success("User deleted successfully!");
        navigate('/userdetails');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Error deleting user');
        
        navigate('/userdetails');
      }
    };

    deleteUser();
  }, [id, navigate]);

  return (
    <div>
      <h2>Deleting user...</h2>
    </div>
  );
}

export default DeleteUser;
