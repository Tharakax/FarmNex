import React from 'react';
import './User.css';

function User({ user, onEdit, onDelete }) {
  return (
    <div className="user-card">
      <div className="user-header">
        <h2>{user.fullName}</h2>
        <span className={`role-badge ${user.role.toLowerCase()}`}>
          {user.role}
        </span>
      </div>

      <div className="user-details">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Age:</strong> {user.age}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
        {user.address && <p><strong>Address:</strong> {user.address}</p>}
        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="user-actions">
        <button className="edit-btn" onClick={() => onEdit(user)}>Edit</button>
        <button className="delete-btn" onClick={() => onDelete(user)}>Delete</button>
      </div>
    </div>
  );
}

export default User;
